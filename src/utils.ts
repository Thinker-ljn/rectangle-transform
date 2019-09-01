export type N = number | undefined | null
export function isNum (n: N) {
  return typeof n === 'number' && !isNaN(n)
}

export function isDef (n: any) {
  return typeof n !== void 0
}

function compare (fn: (...values: number[]) => number, ...values: any[]): N {
  const nums = values.filter((n) => isNum(n))
  if (nums.length) {
    return fn.apply(null, nums)
  }
  return void 0
}

export function getMax (...values: N[]): N {
  return compare(Math.max, ...values)
}

export function getMin (...values: N[]): N {
  return compare(Math.min, ...values)
}

export function getAbs (value: any) {
  if (isNum(value)) {
    return Math.abs(value)
  }
  return void 0
}
