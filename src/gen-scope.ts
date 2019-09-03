import { N, getMax, getMin, isNum, getAbs, isDef } from './utils'

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
export type RangeTuple = [N, N] | undefined
export type Scope = [RangeTuple, RangeTuple]
type BorderCtrl = 't' | 'l' | 'b' | 'r'
type MoveCtrl = 'x' | 'y'
export type SingleCtrl = BorderCtrl | MoveCtrl
type MixinCtrl = 'lt' | 'lb' | 'rb' | 'rt' | 'xy'
export type Ctrl = MixinCtrl | SingleCtrl
export type ScopeValue = [number, number, number] // init-value min max
type AxisKey = 'h' | 'v'
type RangeKey = 'start' | 'end'
type Factor = -1 | 1
interface AxisOption {
  outerAxis: SingleRange
  innerAxis: SingleRange
  targetAxis: SingleRange
  crossCtrlKeys: [BorderCtrl, BorderCtrl]
  rangeKey: RangeKey
  oppositeRangeKey: RangeKey
  factor: Factor
  axisKey: AxisKey
  crossAxisKey: AxisKey
  isStartSide: boolean
}

export default function genCtrlScope (
  ctrl: Ctrl,
  target: Bbox,
  maximum: Partial<Bbox>,
  minimum: Partial<Bbox>,
  // reverse: boolean = false,
  fixedRate?: number,
): Scope {
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

  function genBelongsAxis (axisKey: AxisKey, control: SingleCtrl): AxisOption {
    const isStartSide = ['l', 't'].includes(control)
    return {
      outerAxis: outerRange[axisKey],
      innerAxis: innerRange[axisKey],
      targetAxis: targetRange[axisKey],
      crossCtrlKeys: axisKey === 'h' ? ['t', 'b'] : ['l', 'r'],
      factor: isStartSide ? -1 : 1,
      crossAxisKey: axisKey === 'h' ? 'v' : 'h',
      rangeKey: isStartSide ? 'start' : 'end',
      oppositeRangeKey: isStartSide ? 'end' : 'start',
      axisKey,
      isStartSide,
    }
  }

  function getMainAxis (control: SingleCtrl) {
    const axisKey = ['l', 'r', 'x'].includes(control) ? 'h' : 'v'
    return genBelongsAxis(axisKey, control)
  }

  function getCrossAxis (control: SingleCtrl) {
    const axisKey = ['l', 'r', 'x'].includes(control) ? 'v' : 'h'
    return genBelongsAxis(axisKey, control)
  }

  function getBorderScope (control: BorderCtrl, fixedLen?: RangeTuple): RangeTuple {
    const {
      outerAxis, innerAxis, targetAxis,
      factor, rangeKey, oppositeRangeKey,
      isStartSide,
    } = getMainAxis(control)
    const targetRelativeBorder = targetAxis[oppositeRangeKey]
    let outerLen = outerAxis.len
    let innerLen = innerAxis.len
    if (fixedLen) {
      const [minLen, maxLen] = fixedLen
      outerLen = getMin(outerLen, maxLen)
      innerLen = getMax(innerLen, minLen)
    }
    // outer
    const outerBorder = outerAxis[rangeKey]
    const outerLenBorder = targetRelativeBorder + outerLen * factor
    const getFinalOuter = isStartSide ? getMax : getMin
    const finalOuterBorder = getFinalOuter(outerBorder, outerLenBorder)
    // inner
    const innerBorder = innerAxis[rangeKey]
    const innerLenBorder = targetRelativeBorder + (innerLen || 0 /** reverse = false */) * factor
    const getFinalInner = isStartSide ? getMin : getMax
    const finalInnerBorder = getFinalInner(innerBorder, innerLenBorder)

    return isStartSide ? [finalOuterBorder, finalInnerBorder] : [finalInnerBorder, finalOuterBorder]
  }

  function getFixedLen (control: BorderCtrl, another?: BorderCtrl): RangeTuple {
    if (!fixedRate) {
      return void 0
    }
    const {crossCtrlKeys, crossAxisKey} = getCrossAxis(control)
    const finalRate = crossAxisKey === 'h' ? 1 / fixedRate : fixedRate
    let bigLen = void 0
    let smallLen = void 0
    if (!isDef(another)) {
      const [crossStartCtrl, crossEndCtrl] = crossCtrlKeys
      const startScope = getBorderScope(crossStartCtrl)
      const endScope = getBorderScope(crossEndCtrl)

      const crossAxis = targetRange[crossAxisKey]
      const smallOuter = getMin(
        getAbs(startScope[0] - crossAxis.start),
        getAbs(endScope[1] - crossAxis.end),
      )
      const bigInner = getMax(
        getAbs(startScope[1] - crossAxis.start),
        getAbs(endScope[0] - crossAxis.end),
      )
      if (isNum(smallOuter)) {
        const bigCrossLen = crossAxis.len + smallOuter * 2
        bigLen = bigCrossLen * finalRate
      }

      if (isNum(bigInner)) {
        const smallCrossLen = crossAxis.len + bigInner * 2
        smallLen = smallCrossLen * finalRate
      }
    } else {
      const {oppositeRangeKey, targetAxis} = getMainAxis(another)
      const [anotherMinScope, anotherMaxScope] = getBorderScope(another)
      smallLen = getAbs(anotherMinScope - targetAxis[oppositeRangeKey])
      bigLen = getAbs(anotherMaxScope - targetAxis[oppositeRangeKey])
    }
    return [smallLen, bigLen]
  }

  function genSingleBorderScope (control: BorderCtrl, another?: BorderCtrl): RangeTuple {
    const fixedBorderLen = getFixedLen(control, another)
    const border = getBorderScope(control, fixedBorderLen)
    return border
  }

  function genMoveScope (key: AxisKey): RangeTuple {
    const outer = outerRange[key]
    const inner = innerRange[key]
    const {len: targetlen} = targetRange[key]
    return [
      getMax(outer.start, inner.end - targetlen),
      getMin(inner.start, outer.end - targetlen),
    ]
  }
  let scopeH: RangeTuple = void 0
  let scopeV: RangeTuple = void 0
  if (ctrl === 'xy') {
    scopeH = genMoveScope('h')
    scopeV = genMoveScope('v')
  } else if (ctrl === 'x') {
    scopeH = genMoveScope('h')
  } else if (ctrl === 'y') {
    scopeV = genMoveScope('v')
  } else if (/^[l|r]$/.test(ctrl)) {
    scopeH = genSingleBorderScope(ctrl as BorderCtrl)
  } else if (/^[t|b]$/.test(ctrl)) {
    scopeV = genSingleBorderScope(ctrl as BorderCtrl)
  } else {
    const c1 = ctrl[0] as BorderCtrl
    const c2 = ctrl[1] as BorderCtrl
    scopeH = genSingleBorderScope(c1, c2)
    scopeV = genSingleBorderScope(c2, c1)
  }
  return [scopeH, scopeV]
}
