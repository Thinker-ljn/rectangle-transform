import genCtrlScope, { Ctrl, Rect, Bbox } from './scpoed'
import { genInitPositon, getMovement, calcNewPosition } from './calculation';

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
) {
  const {control, target, maximum, minimum} = options
  const position = genInitPositon(control, target)
  const ranges = genCtrlScope(control, target, maximum, minimum)
  function getNewTarget (ev: MouseEvent) {
    const movement = getMovement(ev, startEvent)
    const newPosition = calcNewPosition(movement, position, ranges)
  }
}
