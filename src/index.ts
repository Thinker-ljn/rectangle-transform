import genCtrlScope, { Ctrl, Rect, Bbox, ScopeValue, Ranges } from './scpoed'

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

function getMovement (currEvent: MouseEvent, startEvent: MouseEvent) {
  return {
    x: currEvent.clientX - startEvent.clientX,
    y: currEvent.clientY - startEvent.clientY,
  }
}

function genInitPositon (ctrl: Ctrl, target: Rect): Partial<Pointer> {
  const {left: x, top: y, width: w, height: h} = target
  const r = x + w
  const b = y + h

  switch (ctrl) {
    case 'l': return {x}
    case 'lt': return {x, y}
    case 't': return {y}
    case 'rt': return {x: r, y}
    case 'r': return {x: r}
    case 'rb': return {x: r, y: b}
    case 'b': return {y: b}
    case 'lb': return {x, y: b}
    case 'x': return {x}
    case 'xy': return {x, y}
    case 'y': return {y}
  }
}

function calcNewPosition (offset: Pointer, init: Partial<Pointer>, scope: Ranges) {
  function inScope (offsetValue: number, initValue: number | ScopeValue) {
    if (typeof initValue === 'number') {
      return initValue + offsetValue
    } else {
      const [value, min, max] = initValue
      return Math.min(max, Math.max(min, offsetValue + value))
    }
  }
  const {x: ox, y: oy} = offset
  const {x: ix, y: iy} = init
  const [sx, sy] = scope

  const result: Partial<Pointer> = {}
  if (sx && typeof ix === 'number') {
    result.x = inScope(ox, [ix, sx[0], sx[1]])
  }
  if (sy && typeof iy === 'number') {
    result.y = inScope(oy, [iy, sy[0], sy[1]])
  }
  return result
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
