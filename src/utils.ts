export type N = number | undefined | null
export function isNum (n: N) {
  return typeof n === 'number' && !isNaN(n)
}

export function isDef (n: any) {
  return typeof n !== void 0
}

function compare (a: N, b: N, fn: (...values: number[]) => number): N {
  const an = isNum(a)
  const bn = isNum(b)
  if (an && bn) {
    return fn(a, b)
  }

  if (!an && bn) {
    return b
  }

  if (an && !bn) {
    return a
  }

  return void 0
}

export function getMax (a: N, b: N): N {
  return compare(a, b, Math.max)
}

export function getMin (a: N, b: N): N {
  return compare(a, b, Math.min)
}
