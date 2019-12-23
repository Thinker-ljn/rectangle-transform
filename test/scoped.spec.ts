import genCtrlScope, { RTBbox, RTCtrl, RTScope } from '../src/gen-scope'

const tg = {left: 20, width: 20, right: 40, top: 20, height: 20, bottom: 40}
type InputDatas = Array<[RTCtrl, Partial<RTBbox>, Partial<RTBbox>, RTScope, RTBbox]>
const testInputs: InputDatas = [
  ['x', {left: -10, right: 50}, {}, [[-10, 30], void 0], tg],
  ['x', {left: -10, right: 50}, {left: 30, right: 40}, [[20, 30], void 0], tg],
  ['y', {top: -10, bottom: 50}, {}, [[-10, 30], void 0], tg],
  ['y', {top: -10, bottom: 50}, {top: 30, bottom: 40}, [void 0, [20, 30]], tg],
  ['l', {}, {}, [[void 0, 40], void 0], tg],
  ['l', {width: 50}, {}, [[-10, 40], void 0], tg],
  ['l', {left: 0, width: 50}, {}, [[0, 40], void 0], tg],
  ['l', {left: 0, width: 30}, {}, [[10, 40], void 0], tg],
  ['r', {}, {}, [[20, void 0], void 0], tg],
  ['r', {width: 50}, {}, [[20, 70], void 0], tg],
  ['r', {right: 40, width: 50}, {}, [[20, 40], void 0], tg],
  ['r', {right: 60, width: 60}, {}, [[20, 60], void 0], tg],
]

describe('scoped of controll', () => {
  test.each(testInputs)('controll %s, max %o, mim %o', (c, a, i, e, t) => {
    const scoped = genCtrlScope(c, t, a, i)
    expect(scoped).toEqual(expect.arrayContaining(e))
  })
})
