import { getMax, getMin } from '../src/utils'

describe.only('compare', () => {
  it('max', () => {
    expect(getMax(5, void 0)).toEqual(5)
    expect(getMax(5, 6)).toEqual(6)
    expect(getMax(void 0, void 0)).toEqual(void 0)
  })

  it('min', () => {
    expect(getMin(5, void 0)).toEqual(5)
    expect(getMin(790, 737)).toEqual(737)
    expect(getMin(void 0, void 0)).toEqual(void 0)
  })
})
