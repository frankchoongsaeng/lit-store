import { persist, localStorageAdapter } from '../../lib/persist'
import { withDevtools } from '../../devtools/redux'
import { todosStore } from './state'

withDevtools(todosStore, 'todos')

await persist(todosStore, {
    key: 'todos',
    adapter: localStorageAdapter,
    version: 1
})
