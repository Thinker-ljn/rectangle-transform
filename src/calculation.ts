import { RTCtrl, RTRect, RTScope, RTBbox, RTRangeTuple } from './gen-scope'
import { RTPointer } from './gen-scope'
import { isNum } from './utils'

export function getMovement (currEvent: MouseEvent, startEvent: MouseEvent) {
  return {
    x: currEvent.clientX - startEvent.clientX,
    y: currEvent.clientY - startEvent.clientY,
  }
}

export function genInitPositon (ctrl: RTCtrl, target: RTRect): Partial<RTPointer> {
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
  return {x, y}
}

export function calcNewPosition (offset: RTPointer, init: Partial<RTPointer>, scope: RTScope) {
  function inScope (offsetValue: number, initValue: number, range: RTRangeTuple) {
    if (!range) {
      return initValue + offsetValue
    } else {
      const [min, max] = range
      let value = offsetValue + initValue
      if (isNum(min)) {
        value = Math.max(min, value)
      }
      if (isNum(max)) {
        value = Math.min(max, value)
      }
      return value
    }
  }
  const {x: ox, y: oy} = offset
  const {x: ix, y: iy} = init
  const [sx, sy] = scope

  const result: Partial<RTPointer> = {}
  if (sx && isNum(ix)) {
    result.x = inScope(ox, ix, sx)
  }
  if (sy && isNum(iy)) {
    result.y = inScope(oy, iy, sy)
  }
  return result
}
// rate = w / h
export function fixed (ctrl: RTCtrl, target: RTRect, rate: number) {
  const {left, top, width, height} = target
  const r = {...target}
  function fixV (share = false) {
    const fixedH = width / rate
    r.height = fixedH
    return top - (fixedH - height) / (share ? 2 : 1)
  }
  function fixH (share = false) {
    const fixedW = height * rate
    r.width = fixedW
    return left - (fixedW - width) / (share ? 2 : 1)
  }
  function fixHV (h: 'left' | '', v: 'top' | '') {
    const currRate = width / height
    if (currRate < rate) {
      const value = fixH()
      if (h) {
        r[h] = value
      }
    }
    if (currRate > rate) {
      const value = fixV()
      if (v) {
        r[v] = value
      }
    }
  }
  switch (ctrl) {
    case 'l': r.top = fixV(true); break
    case 'lt': fixHV('left', 'top'); break
    case 't': r.left = fixH(true); break
    case 'rt': fixHV('', 'top'); break
    case 'r': r.top = fixV(true); break
    case 'rb': fixHV('', ''); break
    case 'b': r.left = fixH(true); break
    case 'lb': fixHV('left', ''); break
  }
  return r
}

export function genNewTarget (ctrl: RTCtrl, position: Partial<RTPointer>, target: RTBbox): RTRect {
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
  return target
}

export function genBbox (target: RTRect) {
  const {left, top, width, height} = target
  const right = left + width
  const bottom = top + height
  return { x: left, y: top, left, top, right, bottom, width, height }
}


export function toProportion (ctrl: RTCtrl, target: RTRect, step: number | [number, number]) {
  const [hStep, vStep] = typeof step === 'number' ? [step, step] : step
  const proportion =  {
    left: target.left / hStep,
    width: target.width / hStep,
    top: target.top / vStep,
    height: target.height / vStep,
  }
  const fixedMinSide = (min: number, len: number) => {
    const re = Math.floor(min)
    const dx = min - re
    len = Math.round(len + dx)
    min = re
    return {min, len}
  }
  const {left, width, top, height} = proportion
  if (ctrl.indexOf('l') > -1) {
    const {min, len} = fixedMinSide(left, width)
    proportion.left = min
    proportion.width = len
  } else {
    proportion.left = Math.round(left)
    proportion.width = Math.round(width)
  }
  if (ctrl.indexOf('t') > -1) {
    const {min, len} = fixedMinSide(top, height)
    proportion.top = min
    proportion.height = len
  } else {
    proportion.top = Math.round(top)
    proportion.height = Math.round(height)
  }
  const stepTarget =  {
    left: proportion.left * hStep,
    width: proportion.width * hStep,
    top: proportion.top * vStep,
    height: proportion.height * vStep,
  }
  return {proportion, stepTarget}
}
