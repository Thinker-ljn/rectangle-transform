import { N, getMax, getMin } from './utils'

export interface Size {
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

export interface Ranges {
  start?: N
  end?: N
  len?: N
}
export type Range = [N, N]
export type Scope = [Range, Range]
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
): Scope {
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

function getVertical (bbox: Partial<Bbox>): Ranges {
  const {top: start, height: len, bottom: end} = bbox
  return {start, len, end}
}

function getHorizontal (bbox: Partial<Bbox>): Ranges {
  const {left: start, width: len, right: end} = bbox
  return {start, len, end}
}

function genLT (rb: number, outer: Ranges, inner: Ranges): Range {
  return [
    getMax(rb - outer.len, outer.start),
    getMin(rb - (inner.len || 0), inner.start),
  ]
}

function genRB (lt: number, outer: Ranges, inner: Ranges): Range {
  return [
    getMax(lt + (inner.len || 0), inner.end),
    getMin(lt + outer.len, outer.end),
  ]
}

function genXY (wh: number, outer: Ranges, inner: Ranges): Range {
  return [
    getMax(outer.start, inner.end - wh),
    getMin(inner.start, outer.end - wh),
  ]
}
