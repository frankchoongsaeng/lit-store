# Redux DevTools

lit-store can integrate with the Redux DevTools browser extension so you can inspect changes over time.

```ts
import { withDevtools } from 'lit-store/devtools/redux'

withDevtools(store, 'counter')
```

The second argument is a name that appears in the DevTools panel. State changes from the store will show up as actions, making debugging easier.
