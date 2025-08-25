# Getting Started

This guide shows the basics of creating and using a store.

## 1. Create a store

```ts
import { createStore } from 'lit-store/lib/store'

const store = createStore({ count: 0 })
```

`createStore` takes an initial state object. The store holds the state and lets you update it later.

## 2. Connect the store to a Lit element

```ts
import { html, LitElement } from 'lit'
import { StoreController } from 'lit-store/lib/store-controller'

class CounterElement extends LitElement {
  private count = new StoreController(this, store, s => s.count)

  render() {
    return html`
      <button @click=
        ${() => store.setState({ count: this.count.value + 1 })}>
        Count: ${this.count.value}
      </button>
    `
  }
}
```

`StoreController` keeps the element in sync with the store. When state changes the element updates automatically.

## 3. Subscribe to part of the state

You can subscribe to only the bits of state you care about by passing a selector function to `StoreController` or `store.select`.

```ts
store.select(s => s.count).subscribe(value => {
  console.log('count changed to', value)
})
```

Selectors help avoid unnecessary updates and make your components faster.
