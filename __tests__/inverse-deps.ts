import { inverseDeps } from '../src/inverse-deps'

describe('inverseDeps', () => {
  it('should inverse deps', () => {
    const deps = new Map([
      ['a', new Set(['1', '2'])],
      ['b', new Set(['1', '2', '3'])],
    ])

    const inverse = inverseDeps(deps)

    expect(inverse).toStrictEqual(
      new Map([
        ['1', new Set(['a', 'b'])],
        ['2', new Set(['a', 'b'])],
        ['3', new Set(['b'])],
      ])
    )
  })
})
