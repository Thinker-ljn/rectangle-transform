import genCtrlScope from '../src/gen-scope'

const target = {left: 20, width: 20, right: 40, top: 20, height: 20, bottom: 40}
describe('controll x,y scope', () => {
  describe('controll x', () => {
    it('test 1', () => {
      const scoped = genCtrlScope(
        'x',
        target,
        {left: -10, right: 50},
        {left: 30, right: 40},
      )
      expect(scoped).toEqual(expect.arrayContaining([[20, 30], void 0]))
    })
  })
  describe('controll y', () => {
    it('test 1', () => {
      const scoped = genCtrlScope(
        'y',
        target,
        {top: -10, bottom: 50},
        {top: 30, bottom: 40},
      )
      expect(scoped).toEqual(expect.arrayContaining([void 0, [20, 30]]))
    })
  })
})

describe.only('controll l scope', () => {
  it('empty', () => {
    expect(genCtrlScope(
      'l',
      target,
      {},
      {},
    )).toEqual(expect.arrayContaining(
      [[void 0, 40], void 0],
    ))
  })
})
