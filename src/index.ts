import genCtrlScope, { Ctrl, Rect, Bbox } from './gen-scope'
import { genInitPositon, getMovement, calcNewPosition, genBbox, genNewTarget, fixed } from './calculation'

type UserDefinedHandler = ({target: Rect, ev: MouseEvent}) => void | Rect
export interface Pointer {
  x: number
  y: number
}
interface Options {
  control: Ctrl
  target: Rect
  maximum?: Partial<Bbox>
  minimum?: Partial<Bbox>
  step?: number
  rate?: number
}

export default function listener (
  startEvent: MouseEvent,
  options: Options,
  userMove: UserDefinedHandler | Pointer, // move callback or user def movement
  userFinished?: UserDefinedHandler,
) {
  const {control, target, maximum, minimum, rate} = options
  const bbox = genBbox(target)
  const position = genInitPositon(control, target)
  const scopes = genCtrlScope(control, bbox, maximum, minimum, rate)
  function getNewTarget (ev: MouseEvent | Pointer) {
    let movement = ev
    if (ev instanceof MouseEvent) {
      movement = getMovement(ev, startEvent)
    }
    const newPosition = calcNewPosition(movement, position, scopes)
    let newTarget = genNewTarget(control, newPosition, bbox)
    if (rate) {
      newTarget = fixed(control, newTarget, rate)
    }
    return newTarget
  }

  function whenMove (ev: MouseEvent) {
    ev.preventDefault()
    if (typeof userMove === 'function') {
      const newTarget = getNewTarget(ev)
      userMove({target: newTarget, ev})
    }
  }
  function whenFinished (ev: MouseEvent) {
    ev.preventDefault()
    removeListener()
    clearSelection()
    if (userFinished) {
      const newTarget = getNewTarget(ev)
      userFinished({target: newTarget, ev})
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
