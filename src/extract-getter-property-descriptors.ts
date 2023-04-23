export const extractGetterPropertyDescriptors = <T extends object>(
  initialStore: T
) =>
  Object.keys(initialStore).reduce<Map<keyof T, PropertyDescriptor>>(
    (accumulator, key) => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        initialStore,
        key
      )
      propertyDescriptor?.get &&
        accumulator.set(key as keyof T, propertyDescriptor)

      return accumulator
    },
    new Map()
  )
