import { N, getMax, getMin, isNum, getAbs } from './utils'

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
interface BaseRange {
  start?: number
  end?: number
}
export interface SingleRange extends BaseRange {
  len?: N
}
export interface AxisRange {
  h: SingleRange
  v: SingleRange
}

export type Scope = [BaseRange, BaseRange]
type BorderCtrl = 't' | 'l' | 'b' | 'r'
export type SingleCtrl = BorderCtrl | 'x' | 'y'
type MixinCtrl = 'lt' | 'lb' | 'rb' | 'rt' | 'xy'
export type Ctrl = MixinCtrl | SingleCtrl
export type ScopeValue = [number, number, number] // init-value min max

// export const tuple = <T extends string[]>(...args: T) => args
// export const CtrlNames = tuple('left', 'top', 'right', 'bottom', 'x', 'y')
// export type CtrlName = (typeof CtrlNames)[number]

// function getFullName (control: SingleCtrl): CtrlName {
//   return CtrlNames.find((str) => str.startsWith(control))
// }

type AxisKey = 'h' | 'v'
function getAxisKey (control: SingleCtrl): AxisKey {
  return ['l', 'r', 'x'].includes(control) ? 'h' : 'v'
}
type RangeKey = 'start' | 'end'
type Factor = -1 | 1
function getRelativeKey (control: BorderCtrl): [RangeKey, RangeKey, Factor] {
  return ['l', 't'].includes(control) ? ['start', 'end', -1] : ['end', 'start', 1]
}
function getCrossKeys (control: BorderCtrl, another?: BorderCtrl): [AxisKey, BorderCtrl, BorderCtrl | undefined] {
  if (another) {
    return ['l', 'r'].includes(control) ? ['v', another, void 0] : ['h', another, void 0]
  }
  return ['l', 'r'].includes(control) ? ['v', 't', 'b'] : ['h', 'l', 'r']
}

export default function genCtrlScope (
  ctrl: Ctrl,
  target: Bbox,
  maximum: Partial<Bbox>,
  minimum: Partial<Bbox>,
  reverse: boolean = false,
  fixedRate?: number,
) {
  function genRange (bbox: Partial<Bbox>): AxisRange {
    const {
      left, width, right,
      top, height, bottom,
    } = bbox
    return {
      h: {start: left, len: width, end: right},
      v: {start: top, len: height, end: bottom},
    }
  }
  const outerRange = genRange(maximum)
  const innerRange = genRange(minimum)
  const targetRange = genRange(target)

  function genBorderScope (control: BorderCtrl) {
    const axisKey = getAxisKey(control) // h | v
    const outer = outerRange[axisKey]
    const inner = innerRange[axisKey]
    const {innerLen, outerLen} = getLen(control)
    const [rangeKey, relativeKey, factor] = getRelativeKey(control)
    const targetRelativeBorder = targetRange[axisKey][relativeKey]
    // outer
    const outerBorder = outer[rangeKey]
    const outerLenBorder = targetRelativeBorder + outerLen * factor
    const getFinalOuter = rangeKey === 'start' ? getMax : getMin
    const finalMinBorder = getFinalOuter(outerBorder, outerLenBorder)
    // inner
    const innerBorder = inner[rangeKey]
    const innerLenBorder = targetRelativeBorder + (innerLen || 0 /** reverse = false */) * factor
    const getFinalInner = rangeKey === 'start' ? getMin : getMax
    const finalMaxBorder = getFinalInner(innerBorder, innerLenBorder)
    // todo: fixedBorder

    return [finalMinBorder, finalMaxBorder]
  }

  function getLen (control: BorderCtrl) {
    const axisKey = getAxisKey(control) // h | v
    const outer = outerRange[axisKey]
    const inner = innerRange[axisKey]
    let outerLen = outer.len
    let innerLen = inner.len
    if (fixedRate) {
      const [smallLen, bigLen] = genFixedLen(control, fixedRate)
      outerLen = getMax(outerLen, bigLen)
      innerLen = getMax(smallLen, bigLen)
    }
    return {innerLen, outerLen}
  }

  function genFixedLen (control: BorderCtrl, rate: number) {
    const [crossAxisKey, crossStartCtrl, crossEndCtrl] = getCrossKeys(control)
    const startScope = genBorderScope(crossStartCtrl)
    const endScope = genBorderScope(crossEndCtrl)

    const crossAxis = targetRange[crossAxisKey]
    const smallOuter = getMin(
      getAbs(startScope[0] - crossAxis.start),
      getAbs(endScope[1] - crossAxis.end),
    )
    const bigInner = getMax(
      getAbs(startScope[1] - crossAxis.start),
      getAbs(endScope[0] - crossAxis.end),
    )
    const finalRate = crossAxisKey === 'h' ? 1 / rate : rate
    let bigLen = void 0
    let smallLen = void 0
    if (isNum(smallOuter)) {
      const bigCrossLen = crossAxis.len + smallOuter * 2
      bigLen = bigCrossLen * finalRate
    }

    if (isNum(bigInner)) {
      const smallCrossLen = crossAxis.len + bigInner * 2
      smallLen = smallCrossLen * finalRate
    }
    return [smallLen, bigLen]
  }

  function genMoveScope (control: 'x' | 'y') {
    const key = getAxisKey(control)
    const outer = outerRange[key]
    const inner = innerRange[key]
    const {len: targetlen} = targetRange[key]
    return [
      getMax(outer.start, inner.end - targetlen),
      getMin(inner.start, outer.end - targetlen),
    ]
  }

  if (ctrl === 'xy') {
    return
  }

  if (ctrl.length === 1) {
    return
  }

  const c1 = ctrl[0] as BorderCtrl
  const c2 = ctrl[1] as BorderCtrl
}
