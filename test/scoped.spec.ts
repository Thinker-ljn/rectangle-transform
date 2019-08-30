import genScope from '../src/scpoed'

describe('scoped left', () => {
  it('when empty maximum, minimum', () => {
    const scoped = genScope(
      'l',
      {left: 0, top: 0, width: 10, height: 10},
      {},
      {},
    )
    expect(scoped).toEqual(expect.arrayContaining([void 0, 10]))
  })
  it('when max width', () => {
    const scoped = genScope(
      'l',
      {left: 30, width: 10, top: 0, height: 10}, // right: 40
      {left: -10, width: 20, right: 50},
      {},
    )
    expect(scoped).toEqual(expect.arrayContaining([20, 40]))
  })
  it('when max left', () => {
    const scoped = genScope(
      'l',
      {left: 30, width: 10, top: 0, height: 10}, // right: 40
      {left: -10, width: 60, right: 50},
      {},
    )
    expect(scoped).toEqual(expect.arrayContaining([-10, 40]))
  })
  it('when max left, min width', () => {
    const scoped = genScope(
      'l',
      {left: 30, width: 10, top: 0, height: 10}, // right: 40
      {left: -10, width: 60, right: 50},
      {width: 10},
    )
    expect(scoped).toEqual(expect.arrayContaining([-10, 30]))
  })
})
