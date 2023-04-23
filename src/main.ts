import { detectGetterDeps } from 'detective-getter-deps'
import { extractGetterPropertyDescriptors } from './extract-getter-property-descriptors'
import type { StateCreator, StoreMutatorIdentifier } from 'zustand/vanilla'
import { inverseDeps } from './inverse-deps'

type StatefulGetter = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  storeInitializer: StateCreator<T, Mps, Mcs>
) => StateCreator<T, Mps, Mcs>

type StatefulGetterImpl = <T extends object>(
  storeInitializer: StateCreator<T, [], []>
) => StateCreator<T, [], []>

const statefulGetterImpl: StatefulGetterImpl =
  (storeInitializer) => (set, get, api) => {
    const initialStore = storeInitializer(set, get, api)
    type T = typeof initialStore

    const getterDeps = detectGetterDeps(initialStore)
    const propertyDependants = inverseDeps(getterDeps)

    const getterPropertyDecriptors =
      extractGetterPropertyDescriptors(initialStore)

    const { setState: previousSetState } = api

    const invalidateDependantGetters =
      (partial: Parameters<typeof set>[0]) => (currentState: T) => {
        const nextStatePartial =
          typeof partial === 'function' ? partial(currentState) : partial

        const invalidationRequiredGetterKeys = Object.keys(
          nextStatePartial
        ).reduce((accumulator, partialKey) => {
          const dependantGetters = propertyDependants.get(partialKey as keyof T)
          dependantGetters?.forEach((dependant) => accumulator.add(dependant))

          return accumulator
        }, new Set<keyof T>())

        const dependantsPartial = Array.from(
          invalidationRequiredGetterKeys
        ).reduce<Partial<T>>((accumulator, dependantKey) => {
          const propertyDescriptor = getterPropertyDecriptors.get(dependantKey)
          propertyDescriptor?.get &&
            (accumulator[dependantKey] =
              propertyDescriptor.get.call(currentState))

          return accumulator
        }, {})

        return dependantsPartial
      }

    api.setState = (partial, replace) => {
      previousSetState(partial, replace)
      previousSetState(invalidateDependantGetters(partial))
    }

    return storeInitializer(
      (partial, replace) => {
        set(partial, replace)
        set(invalidateDependantGetters(partial))
      },
      get,
      api
    )
  }

export const statefulGetter = statefulGetterImpl as StatefulGetter
