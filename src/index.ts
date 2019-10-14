import genCtrlScope, { Ctrl, Rect, Bbox } from './gen-scope'
import { genInitPositon, getMovement, calcNewPosition, genBbox, genNewTarget, fixed, toProportion } from './calculation'

interface UserDefinedHandlerParams {
  target: Rect,
  rawTarget?: Rect,
  porportion?: Rect,
  stepTarget?: Rect,
  ev: MouseEvent
}
type UserDefinedHandler = (params: UserDefinedHandlerParams) => void | Rect
export interface Pointer {
  x: number
  y: number
}
export interface Options {
  control: Ctrl
  target: Rect
  maximum?: Partial<Bbox>
  minimum?: Partial<Bbox>
  step?: number | [number, number]
  rate?: number
}

export default function listener (
  startEvent: MouseEvent,
  options: Options,
  userMove: UserDefinedHandler | Pointer, // move callback or user def movement
  userFinished?: UserDefinedHandler,
) {
  const {
    control, target, maximum = {}, minimum = {}, rate, step,
  } = options
  const bbox = genBbox(target)
  const position = genInitPositon(control, target)
  const scopes = genCtrlScope(control, bbox, maximum, minimum, rate)
  function getNewTarget (ev: MouseEvent | Pointer, isFinish?: boolean) {
    let movement = ev
    if (ev instanceof MouseEvent) {
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

  function whenMove (ev: MouseEvent) {
    ev.preventDefault()
    if (typeof userMove === 'function') {
      const newTarget = getNewTarget(ev)
      userMove({...newTarget, ev})
    }
  }
  function whenFinished (ev: MouseEvent) {
    ev.preventDefault()
    removeListener()
    clearSelection()
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

  if (typeof userMove === 'function') {
    addListener()
  } else {
    const movement = userMove
    const newTarget = getNewTarget(movement)
    return newTarget
  }
}
