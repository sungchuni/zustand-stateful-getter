type GetterPropertyDescriptors<T> = Map<keyof T, PropertyDescriptor>

export const extractGetterPropertyDescriptors = <T>(
  initialStore: T,
  getterDeps: Map<keyof T, Set<keyof T>>
): GetterPropertyDescriptors<T> => {
  const getterKeys = Array.from(getterDeps.keys())

  return getterKeys.reduce<GetterPropertyDescriptors<T>>(
    (accumulator, property) => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        initialStore,
        property
      )
      propertyDescriptor && accumulator.set(property, propertyDescriptor)

      return accumulator
    },
    new Map()
  )
}
