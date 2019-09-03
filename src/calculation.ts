import { Ctrl, Rect, ScopeValue, Scope, Bbox, RangeTuple } from './gen-scope'
import { Pointer } from '.'
import { isNum } from './utils';

export function getMovement (currEvent: MouseEvent, startEvent: MouseEvent) {
  return {
    x: currEvent.clientX - startEvent.clientX,
    y: currEvent.clientY - startEvent.clientY,
  }
}

export function genInitPositon (ctrl: Ctrl, target: Rect): Partial<Pointer> {
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

export function calcNewPosition (offset: Pointer, init: Partial<Pointer>, scope: Scope) {
  function inScope (offsetValue: number, initValue: number, range: RangeTuple) {
    if (!range) {
      return initValue + offsetValue
    } else {
      const [min, max] = range
      let value = offsetValue + initValue
      if (min) {
        value = Math.max(min, value)
      }
      if (max) {
        value = Math.min(max, value)
      }
      return value
    }
  }
  const {x: ox, y: oy} = offset
  const {x: ix, y: iy} = init
  const [sx, sy] = scope

  const result: Partial<Pointer> = {}
  if (sx && isNum(ix)) {
    result.x = inScope(ox, ix, sx)
  }
  if (sy && isNum(iy)) {
    result.y = inScope(oy, iy, sy)
  }
  return result
}

export function genNewTarget (ctrl: Ctrl, position: Partial<Pointer>, target: Bbox): Rect {
  const {x, y} = {x: 0, y: 0, ...position}
  const {left, top, width, height, right, bottom} = target
  switch (ctrl) {
    case 'l':  return {left: x, top, width: right - x, height}
    case 'lt': return {left: x, top: y, width: right - x, height: bottom - y}
    case 't':  return {left, top: y, width, height: bottom - y}
    case 'rt': return {left, top: y, width: x - left, height: bottom - y}
    case 'r':  return {left, top, width: x - left, height}
    case 'rb': return {left, top, width: x - left, height: y - top}
    case 'b':  return {left, top, width, height: y - top}
    case 'lb': return {left: x, top, width: right - x, height: y - top}
    case 'x':  return {left: x, top, width, height}
    case 'xy': return {left: x, top: y, width, height}
    case 'y':  return {left, top: y, width, height}
  }
}

export function genBbox (target: Rect) {
  const {left, top, width, height} = target
  const right = left + width
  const bottom = top + height
  return { x: left, y: top, left, top, right, bottom, width, height }
}
