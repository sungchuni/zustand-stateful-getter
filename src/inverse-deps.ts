type Deps<T> = Map<keyof T, Set<keyof T>>

export const inverseDeps = <T>(deps: Deps<T>) =>
  Array.from(deps.entries()).reduce<Deps<T>>(
    (accumulator, [property, deps]) => {
      deps.forEach((dep) => {
        accumulator.set(dep, (accumulator.get(dep) || new Set()).add(property))
      })

      return accumulator
    },
    new Map()
  )
