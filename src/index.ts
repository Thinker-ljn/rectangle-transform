import genCtrlScope, { RTCtrl, RTRect, RTBbox, RTPointer } from './gen-scope'
import { genInitPositon, getMovement, calcNewPosition, genBbox, genNewTarget, fixed, toProportion } from './calculation'

export interface RTUserDefinedHandlerParams {
  target: RTRect,
  rawTarget?: RTRect,
  proportion?: RTRect,
  stepTarget?: RTRect,
  ev: MouseEvent
}
export type RTUserDefinedHandler = (params: RTUserDefinedHandlerParams) => void | RTRect
export {
  RTCtrl,
  RTBbox,
  RTRect,
}
export interface RTOptions {
  control: RTCtrl
  target: RTRect
  maximum?: Partial<RTBbox>
  minimum?: Partial<RTBbox>
  step?: number | [number, number]
  rate?: number
  animationFrameUpdate?: boolean
}

export interface RTResult {
  target: RTRect
  proportion?: RTRect
  stepTarget?: RTRect
  rawTarget?: RTRect
}

export default function RTListener (
  startEvent: MouseEvent | RTPointer, // startEvent or user def movement,
  options: RTOptions,
  userMove?: RTUserDefinedHandler,
  userFinished?: RTUserDefinedHandler,
) {
  const isSimpleMode = !(startEvent instanceof MouseEvent)
  if (!isSimpleMode && !userMove) {
    throw new Error('请传入 userMove 参数！')
  }

  const {
    control, target, maximum = {}, minimum = {}, rate, step,
    animationFrameUpdate,
  } = options
  const bbox = genBbox(target)
  const position = genInitPositon(control, target)
  const scopes = genCtrlScope(control, bbox, maximum, minimum, rate)

  if (isSimpleMode) {
    const movement = startEvent
    const newTarget = getNewTarget(movement)
    return newTarget
  }

  let currStatus: RTUserDefinedHandlerParams | null = null
  let dragging: boolean = true

  function getNewTarget (ev: MouseEvent | RTPointer, isFinish?: boolean): RTResult {
    let movement = ev
    if (ev instanceof MouseEvent && startEvent instanceof MouseEvent) {
      movement = getMovement(ev, startEvent)
    }
    const newPosition = calcNewPosition(movement, position, scopes)
    let newTarget = genNewTarget(control, newPosition, bbox)
    if (rate) {
      newTarget = fixed(control, newTarget, rate)
    }
    if (step) {
      const {proportion, stepTarget} = toProportion(control, newTarget, step)
      return {target: isFinish ? stepTarget : newTarget, proportion, stepTarget, rawTarget: newTarget}
    }
    return {target: newTarget}
  }
  function runUpdate () {
    requestAnimationFrame(function doUpdate () {
      if (currStatus && typeof userMove === 'function') {
        userMove(currStatus)
      }
      if (dragging) {
        // 继续下一帧
        requestAnimationFrame(doUpdate)
      }
    })
  }
  function whenMove (ev: MouseEvent) {
    ev.preventDefault()
    const newTarget = getNewTarget(ev)
    if (!animationFrameUpdate && typeof userMove === 'function') {
      userMove({...newTarget, ev})
    } else {
      currStatus = {...newTarget, ev}
    }
  }
  function whenFinished (ev: MouseEvent) {
    ev.preventDefault()
    removeListener()
    clearSelection()
    dragging = false
    if (userFinished) {
      const newTarget = getNewTarget(ev, true)
      userFinished({...newTarget, ev})
    }
  }

  function clearSelection () {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }

  function addListener () {
    document.addEventListener('mousemove', whenMove)
    document.addEventListener('mouseup', whenFinished)
  }

  function removeListener () {
    document.removeEventListener('mousemove', whenMove)
    document.removeEventListener('mouseup', whenFinished)
  }

  addListener()
  if (animationFrameUpdate) {
    runUpdate()
  }
  return {target}
}

export function scale (target: RTRect, factor: number, origin: RTPointer) {
  // tslint:disable-next-line: no-console
  console.warn('Method scale will be removed, using method RTScale instead')
  return RTScale(target, factor, origin)
}

export function RTScale (target: RTRect, factor: number, origin: RTPointer) {
  const {width, height, left, top} = target
  const {x, y} = origin

  return {
    left: x - (x - left) * factor,
    top: y - (y - top) * factor,
    width: width * factor,
    height: height * factor,
  }
}

