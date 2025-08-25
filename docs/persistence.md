# State Persistence

Sometimes you want your state to survive a page refresh. The `persist` helper saves and restores the store using a storage adapter.

```ts
import { persist, localStorageAdapter } from 'lit-store/lib/persist'

persist(store, { key: 'counter', adapter: localStorageAdapter })
```

The example above saves the state under the `counter` key in `localStorage`. You can build your own adapter if you need a different storage backend.
