import { statefulGetter } from '../src/main'
import type { StateCreator } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

type NameStore = {
  firstName: string
  lastName: string
  get fullName(): string
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
}

const nameStoreInitializer: StateCreator<NameStore> = (set) => ({
  firstName: 'John',
  lastName: 'Doe',
  get fullName() {
    return [this.firstName, this.lastName].join(' ')
  },
  setFirstName: (firstName: string) => set({ firstName }),
  setLastName: (lastName: string) => set({ lastName }),
})

describe('statefulGetter', () => {
  it('should work with set method', () => {
    const nameStore = createStore(statefulGetter(nameStoreInitializer))

    expect(nameStore.getState().fullName).toBe('John Doe')
    nameStore.getState().setFirstName('Jane')
    expect(nameStore.getState().fullName).toBe('Jane Doe')
    nameStore.getState().setLastName('Smith')
    expect(nameStore.getState().fullName).toBe('Jane Smith')
  })

  it('should work with setState method', () => {
    const nameStore = createStore(statefulGetter(nameStoreInitializer))

    expect(nameStore.getState().fullName).toBe('John Doe')
    nameStore.setState({ firstName: 'Jane' })
    expect(nameStore.getState().fullName).toBe('Jane Doe')
    nameStore.setState({ lastName: 'Smith' })
    expect(nameStore.getState().fullName).toBe('Jane Smith')
  })

  it('should work with setState method with function', () => {
    const nameStore = createStore(statefulGetter(nameStoreInitializer))

    expect(nameStore.getState().fullName).toBe('John Doe')
    nameStore.setState(() => ({ firstName: 'Jane' }))
    expect(nameStore.getState().fullName).toBe('Jane Doe')
    nameStore.setState(() => ({ lastName: 'Smith' }))
    expect(nameStore.getState().fullName).toBe('Jane Smith')
  })
})

describe('interoperability with other middlewares', () => {
  it('should work with subscribeWithSelector', () => {
    const nameStore = createStore<NameStore>()(
      devtools(subscribeWithSelector(statefulGetter(nameStoreInitializer)))
    )

    expect(nameStore.getState().fullName).toBe('John Doe')
    nameStore.getState().setFirstName('Jane')
    expect(nameStore.getState().fullName).toBe('Jane Doe')
    nameStore.getState().setLastName('Smith')
    expect(nameStore.getState().fullName).toBe('Jane Smith')

    const firstNameAgent = jest.fn()
    nameStore.subscribe((state) => state.firstName, firstNameAgent)

    const fullNameAgent = jest.fn()
    nameStore.subscribe((state) => state.fullName, fullNameAgent)

    expect(firstNameAgent).not.toHaveBeenCalled()
    expect(fullNameAgent).not.toHaveBeenCalled()

    nameStore.getState().setFirstName('Jane')
    expect(firstNameAgent).not.toHaveBeenCalled()
    expect(fullNameAgent).not.toHaveBeenCalled()

    nameStore.getState().setFirstName('Paul')
    expect(firstNameAgent).toHaveBeenCalledWith('Paul', 'Jane')
    expect(fullNameAgent).toHaveBeenCalledWith('Paul Smith', 'Jane Smith')

    const { lastCall: firstNameAgentLastCall } = firstNameAgent.mock
    nameStore.getState().setLastName('Collins')
    expect(firstNameAgent).toHaveBeenCalledWith(...firstNameAgentLastCall)
    expect(fullNameAgent).toHaveBeenCalledWith('Paul Collins', 'Paul Smith')
  })
})
