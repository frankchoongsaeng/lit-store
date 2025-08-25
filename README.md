# lit-store

A tiny reactive state container designed for use with [Lit](https://lit.dev/).
It provides a minimal API for creating stores, subscribing to state changes and
connecting state to Lit elements.

## Features

- **Simple API** – create a store and update state with plain objects.
- **Selectors** – subscribe to slices of state with custom equality checks.
- **Lit integration** – `StoreController` keeps Lit components in sync.
- **Persistence** – save and restore state using the `persist` helper.
- **DevTools** – optional Redux DevTools extension integration.

## Installation

```bash
npm install @frankchoongsaeng/lit-store
```

## Basic Usage

Create a store and use the `StoreController` inside a Lit element:

```ts
import { html, LitElement } from 'lit'
import { createStore } from '@frankchoongsaeng/lit-store/lib/store'
import { StoreController } from '@frankchoongsaeng/lit-store/lib/store-controller'

const store = createStore({ count: 0 })

class CounterElement extends LitElement {
  private state = new StoreController(this, store, s => s.count)

  render() {
    return html`
      <button @click=${() => store.setState({ count: this.state.value + 1 })}>
        Count: ${this.state.value}
      </button>
    `
  }
}
```

## Persistence

To persist state across reloads, wrap a store with `persist` and an adapter:

```ts
import { persist, localStorageAdapter } from '@frankchoongsaeng/lit-store/lib/persist'

persist(store, { key: 'counter', adapter: localStorageAdapter })
```

## Redux DevTools

Use `withDevtools` to connect a store to the Redux DevTools extension:

```ts
import { withDevtools } from '@frankchoongsaeng/lit-store/devtools/redux'

withDevtools(store, 'counter')
```

## License

MIT
