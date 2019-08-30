import { N, getMax, getMin, isDef, isNum } from './utils'

interface Size {
  width: number
  height: number
}

export interface Rect extends Size {
  left: number
  top: number
}

export interface Bbox extends Rect {
  right: number
  bottom: number
}

export interface Scope {
  max?: N
  min?: N
  len?: N
}
export type Range = [N, N]
export type Ranges = [Range, Range]
export type CtrlName = 'left' | 'top' | 'right' | 'bottom' | 'x' | 'y'
export type SingleCtrl = 't' | 'l' | 'b' | 'r' | 'x' | 'y'
type MixinCtrl = 'lt' | 'lb' | 'rb' | 'rt' | 'xy'
export type Ctrl = MixinCtrl | SingleCtrl
export type ScopeValue = [number, number, number] // init-value min max

export function genScope (
  singleCtrl: SingleCtrl,
  target: Rect,
  maximum: Partial<Bbox>,
  minimum: Partial<Bbox>,
): Range {
  const bbox = genBbox(target)
  const maxH = getHorizontal(maximum)
  const minH = getHorizontal(minimum)
  const maxV = getVertical(maximum)
  const minV = getVertical(maximum)
  switch (singleCtrl) {
    case 'l':
      return genLT(bbox.right, maxH, minH)
    case 't':
      return genLT(bbox.bottom, maxV, minV)
    case 'x':
      return genXY(bbox.width, maxH, minH)
    case 'r':
      return genRB(bbox.left, maxH, minH)
    case 'b':
      return genRB(bbox.top, maxV, minV)
    case 'y':
      return genXY(bbox.height, maxH, minH)
  }
}

export default function genCtrlScope (
  ctrl: Ctrl,
  target: Rect,
  maximum: Partial<Bbox>,
  minimum: Partial<Bbox>,
): Ranges {
  let [c1, c2] = ctrl.split('')
  if (ctrl.length === 1 && ['t', 'b', 'y'].includes(c1)) {
    [c2, c1] = ctrl.split('')
  }
  const s1 = genScope(c1 as SingleCtrl, target, maximum, minimum)
  const s2 = genScope(c2 as SingleCtrl, target, maximum, minimum)
  return [s1, s2]
}

export function genBbox (target: Rect) {
  const {left, top, width, height} = target
  const right = left + width
  const bottom = top + height
  return { x: left, y: top, left, top, right, bottom, width, height }
}

function getVertical (bbox: Partial<Bbox>): Scope {
  const {top: min, height: len, bottom: max} = bbox
  return {min, len, max}
}

function getHorizontal (bbox: Partial<Bbox>): Scope {
  const {left: min, width: len, right: max} = bbox
  return {min, len, max}
}

function genLT (rb: number, max: Scope, min: Scope): Range {
  return [
    getMax(rb - max.len, max.min),
    getMin(rb - (min.len || 0), min.min),
  ]
}

function genRB (lt: number, max: Scope, min: Scope): Range {
  return [
    getMax(lt + (min.len || 0), min.max),
    getMin(lt + max.len, max.max),
  ]
}

function genXY (wh: number, max: Scope, min: Scope): Range {
  return [
    getMax(max.min, min.max - wh),
    getMin(min.min, max.max - wh),
  ]
}
