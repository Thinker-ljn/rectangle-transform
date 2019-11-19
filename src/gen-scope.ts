import { N, getMax, getMin, isNum, getAbs, isDef, sub } from './utils'
export interface RTPointer {
  x: number
  y: number
}
export interface RTSize {
  width: number
  height: number
}

export interface RTRect extends RTSize {
  left: number
  top: number
}

export interface RTBbox extends RTRect {
  right: number
  bottom: number
}
interface RTBaseRange {
  start: number
  end: number
}
/** 单一轴线范围 */
export interface RTSingleRange extends RTBaseRange {
  len: N
}
/** 水平垂直复合轴线范围 */
export interface RTAxisRange {
  h: Partial<RTSingleRange>
  v: Partial<RTSingleRange>
}
export type RTRangeTuple = [N, N] | undefined
export type RTScope = [RTRangeTuple, RTRangeTuple]
type RTBorderCtrl = 't' | 'l' | 'b' | 'r'
type RTMoveCtrl = 'x' | 'y'
export type RTSingleCtrl = RTBorderCtrl | RTMoveCtrl
type RTMixinCtrl = 'lt' | 'lb' | 'rb' | 'rt' | 'xy'
export type RTCtrl = RTMixinCtrl | RTSingleCtrl
export type RTScopeValue = [number, number, number] // init-value min max
type RTAxisKey = 'h' | 'v'
type RTRangeKey = 'start' | 'end'
type RTFactor = -1 | 1
interface RTAxisOption {
  /** 外部轴线 */
  outerAxis: Partial<RTSingleRange>
  innerAxis: Partial<RTSingleRange>
  targetAxis: RTSingleRange
  crossCtrlKeys: [RTBorderCtrl, RTBorderCtrl]
  rangeKey: RTRangeKey
  oppositeRangeKey: RTRangeKey
  factor: RTFactor
  axisKey: RTAxisKey
  crossAxisKey: RTAxisKey
  isStartSide: boolean
}

export default function genCtrlScope (
  ctrl: RTCtrl,
  target: RTBbox,
  maximum: Partial<RTBbox>,
  minimum: Partial<RTBbox>,
  // reverse: boolean = false,
  fixedRate?: number,
): RTScope {
  function genRange (bbox: Partial<RTBbox>): RTAxisRange {
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

  function genBelongsAxis (axisKey: RTAxisKey, control: RTSingleCtrl): RTAxisOption {
    const isStartSide = ['l', 't'].includes(control)
    return {
      outerAxis: outerRange[axisKey],
      innerAxis: innerRange[axisKey],
      targetAxis: targetRange[axisKey] as RTSingleRange,
      crossCtrlKeys: axisKey === 'h' ? ['t', 'b'] : ['l', 'r'],
      factor: isStartSide ? -1 : 1,
      crossAxisKey: axisKey === 'h' ? 'v' : 'h',
      rangeKey: isStartSide ? 'start' : 'end',
      oppositeRangeKey: isStartSide ? 'end' : 'start',
      axisKey,
      isStartSide,
    }
  }

  function getMainAxis (control: RTSingleCtrl) {
    const axisKey = ['l', 'r', 'x'].includes(control) ? 'h' : 'v'
    return genBelongsAxis(axisKey, control)
  }

  function getCrossAxis (control: RTSingleCtrl) {
    const axisKey = ['l', 'r', 'x'].includes(control) ? 'v' : 'h'
    return genBelongsAxis(axisKey, control)
  }

  function getBorderScope (control: RTBorderCtrl, fixedLen?: RTRangeTuple): RTRangeTuple {
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
    const outerLenBorder = isNum(outerLen) ? targetRelativeBorder + outerLen * factor : void 0
    const getFinalOuter = isStartSide ? getMax : getMin
    const finalOuterBorder = getFinalOuter(outerBorder, outerLenBorder)
    // inner
    const innerBorder = innerAxis[rangeKey]
    const innerLenBorder = targetRelativeBorder + (innerLen || 0 /** reverse = false */) * factor
    const getFinalInner = isStartSide ? getMin : getMax
    const finalInnerBorder = getFinalInner(innerBorder, innerLenBorder)

    return isStartSide ? [finalOuterBorder, finalInnerBorder] : [finalInnerBorder, finalOuterBorder]
  }

  function getFixedLen (control: RTBorderCtrl, another?: RTBorderCtrl): RTRangeTuple {
    if (!fixedRate) {
      return void 0
    }
    const {crossCtrlKeys, crossAxisKey} = getMainAxis(control)
    const finalRate = crossAxisKey === 'h' ? 1 / fixedRate : fixedRate
    let bigLen: N = void 0
    let smallLen: N = void 0
    if (another === undefined) {
      const [crossStartCtrl, crossEndCtrl] = crossCtrlKeys
      const startScope = getBorderScope(crossStartCtrl) || []
      const endScope = getBorderScope(crossEndCtrl) || []

      const crossAxis = targetRange[crossAxisKey]
      const smallOuter = getMin(
        getAbs(sub(crossAxis.end, startScope[0])),
        getAbs(sub(endScope[1], crossAxis.start)),
      )
      const bigInner = getMax(
        getAbs(sub(crossAxis.end, startScope[1])),
        getAbs(sub(endScope[0], crossAxis.start)),
      )
      if (isNum(smallOuter)) {
        bigLen = smallOuter * finalRate
      }

      if (isNum(bigInner)) {
        smallLen = bigInner * finalRate
      }
    } else {
      const {oppositeRangeKey, targetAxis, isStartSide} = getMainAxis(another)
      const crossAxis = targetAxis[oppositeRangeKey]
      const [another1, another2] = getBorderScope(another) || []
      let anotherMinScope
      let anotherMaxScope
      if (isStartSide) {
        anotherMinScope = another2
        anotherMaxScope = another1
      } else {
        anotherMinScope = another1
        anotherMaxScope = another2
      }
      if (isNum(anotherMinScope)) {
        smallLen = (getAbs(sub(anotherMinScope, crossAxis)) || 0) * finalRate
      }
      if (isNum(anotherMaxScope)) {
        bigLen = (getAbs(sub(anotherMaxScope, crossAxis)) || 0) * finalRate
      }
    }
    return [smallLen, bigLen]
  }

  function genSingleBorderScope (control: RTBorderCtrl, another?: RTBorderCtrl): RTRangeTuple {
    const fixedBorderLen = getFixedLen(control, another)
    const border = getBorderScope(control, fixedBorderLen)
    // console.log(control, fixedBorderLen, border)
    return border
  }

  function genMoveScope (key: RTAxisKey): RTRangeTuple {
    const outer = outerRange[key]
    const inner = innerRange[key]
    const {len: targetlen} = targetRange[key]

    return [
      getMax(outer.start, sub(inner.end, targetlen)),
      getMin(inner.start, sub(outer.end, targetlen)),
    ]
  }
  let scopeH: RTRangeTuple = void 0
  let scopeV: RTRangeTuple = void 0
  if (ctrl === 'xy') {
    scopeH = genMoveScope('h')
    scopeV = genMoveScope('v')
  } else if (ctrl === 'x') {
    scopeH = genMoveScope('h')
  } else if (ctrl === 'y') {
    scopeV = genMoveScope('v')
  } else if (/^[l|r]$/.test(ctrl)) {
    scopeH = genSingleBorderScope(ctrl as RTBorderCtrl)
  } else if (/^[t|b]$/.test(ctrl)) {
    scopeV = genSingleBorderScope(ctrl as RTBorderCtrl)
  } else {
    const c1 = ctrl[0] as RTBorderCtrl
    const c2 = ctrl[1] as RTBorderCtrl
    scopeH = genSingleBorderScope(c1, c2)
    scopeV = genSingleBorderScope(c2, c1)
  }
  return [scopeH, scopeV]
}
