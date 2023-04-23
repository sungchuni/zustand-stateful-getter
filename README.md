# zustand-stateful-getter

Let fresh the Zustand object getter.

## Installation

```bash
npm install zustand-stateful-getter
```

`zustand@^4.3.7` is peer dependency.

## Usage

Provides a near-complete transparent API.

```js
import { createStore } from 'zustand/vanilla'
import { statefulGetter } from 'zustand-stateful-getter'

const nameStore = createStore(
  statefulGetter(
    (set) => ({
      firstName: 'John',
      lastName: 'Doe',
      get fullName() {
        return `${this.firstName} ${this.lastName}`
      },
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
    })
  )
)

pizzaStore.getState().fullName // 'John Doe'
pizzaStore.getState().setFirstName('Jane')
pizzaStore.getState().fullName // 'Jane Doe'
```

## Why?

See https://github.com/pmndrs/zustand/issues/132

```js
import { createStore } from 'zustand/vanilla'

const nameStore = createStore(
  (set) => ({
    firstName: 'John',
    lastName: 'Doe',
    get fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    setFirstName: (firstName) => set({ firstName }),
    setLastName: (lastName) => set({ lastName }),
  })
)

pizzaStore.getState().fullName // 'John Doe'
pizzaStore.getState().setFirstName('Jane')
pizzaStore.getState().fullName // 'John Doe', not 'Jane Doe'
```

The `fullName` getter is not updated after `setFirstName` is called. This is because the getter is not a part of the state, and the state is not updated. `zustand-statuful-getter` solves this problem by [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) trap.

With `subscribe` API and the [subscriptionsWithSelector middleware](https://github.com/pmndrs/zustand#using-subscribe-with-selector) could be a solution, but the desire to write store layouts declaratively led to the creation of this middleware.

## Disclaimer

It is recommended that the getter body be written without conditionals. See https://github.com/sungchuni/detective-getter-deps#disclaimer
