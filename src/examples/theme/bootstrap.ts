import { persist, localStorageAdapter } from '../../lib/persist'
import { themeStore } from './state'

await persist(themeStore, {
    key: 'theme',
    adapter: localStorageAdapter,
    version: 1
})
