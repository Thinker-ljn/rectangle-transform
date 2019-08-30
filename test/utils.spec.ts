import { getMax } from '../src/utils'

describe('compare', () => {
  it('max', () => {
    expect(getMax(5, void 0)).toEqual(5)
    expect(getMax(5, 6)).toEqual(6)
    expect(getMax(void 0, void 0)).toEqual(void 0)
  })
})
