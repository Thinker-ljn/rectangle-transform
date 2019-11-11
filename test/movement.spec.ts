import RectTrans from '../src/index'

describe.only('test movement', () => {
  it('with rate', () => {
    const {target} = RectTrans(
      {x: 100, y: 100},
      {
        control: 'rb',
        rate: 2,
        target: {left: 0, top: 0, width: 20, height: 10},
        maximum: {left: 0, top: 0, width: 100, height: 100},
      },
    )
    expect(target).toEqual(expect.objectContaining(
      {left: 0, top: 0, width: 100, height: 50},
    ))
  })
})
