// bootstrap.ts
import { persist, localStorageAdapter } from '../../lib/persist'
import { withDevtools } from '../../devtools/redux'
import { counterStore } from './state'

// Hook DevTools
withDevtools(counterStore, 'counter')

// Persist across reloads
await persist(counterStore, {
    key: 'counter',
    adapter: localStorageAdapter,
    version: 1
})
