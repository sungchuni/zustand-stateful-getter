import { extractGetterPropertyDescriptors } from '../src/extract-getter-property-descriptors'

describe('extractGetterPropertyDescriptors', () => {
  it('should extract getter property descriptors', () => {
    const initialStore = {
      firstName: 'John',
      lastName: 'Doe',
      get fullName() {
        return [this.firstName, this.lastName].join(' ')
      },
    }

    type T = typeof initialStore

    const getterDeps = new Map<keyof T, Set<keyof T>>([
      ['fullName', new Set(['firstName', 'lastName'])],
    ])

    const getterPropertyDescriptors = extractGetterPropertyDescriptors(
      initialStore,
      getterDeps
    )

    expect(getterPropertyDescriptors.size).toBe(1)
    expect(getterPropertyDescriptors.get('fullName')).toStrictEqual({
      configurable: true,
      enumerable: true,
      get: expect.any(Function),
      set: undefined,
    })
  })
})
