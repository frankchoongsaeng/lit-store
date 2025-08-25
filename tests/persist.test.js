import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createStore } from '../build/store.js'
import { persist, localStorageAdapter } from '../build/persist.js'

const flush = () => new Promise(res => setTimeout(res, 0))

describe('persist', () => {
    it('rehydrates state and calls onRehydrate', async () => {
        let stored = JSON.stringify({ v: 1, s: { a: 1 } })
        const adapter = {
            getItem: async () => stored,
            setItem: async () => {}
        }
        const store = createStore({ a: 0 })
        let rehydrated
        await persist(store, { key: 'k', adapter, onRehydrate: s => (rehydrated = s) })
        assert.deepEqual(store.getState(), { a: 1 })
        assert.deepEqual(rehydrated, { a: 1 })
    })

    it('migrates when version differs', async () => {
        let stored = JSON.stringify({ v: 0, s: { a: '1' } })
        const adapter = {
            getItem: async () => stored,
            setItem: async () => {}
        }
        const store = createStore({ a: 0 })
        await persist(store, { key: 'm', adapter, version: 1, migrate: s => ({ a: Number(s.a) }) })
        assert.deepEqual(store.getState(), { a: 1 })
    })

    it('saves partialized state on change', async () => {
        let saved
        const adapter = {
            getItem: async () => null,
            setItem: async (k, v) => {
                saved = v
            }
        }
        const store = createStore({ a: 0, b: 0 })
        await persist(store, { key: 'p', adapter, partialize: s => ({ a: s.a }) })
        store.setState({ a: 2 })
        await flush()
        assert.equal(saved, JSON.stringify({ v: 1, s: { a: 2 } }))
    })
})

describe('localStorageAdapter', () => {
    it('wraps global localStorage', () => {
        const data = {}
        globalThis.localStorage = {
            getItem: k => (k in data ? data[k] : null),
            setItem: (k, v) => {
                data[k] = v
            },
            removeItem: k => {
                delete data[k]
            }
        }
        localStorageAdapter.setItem('a', '1')
        assert.equal(localStorageAdapter.getItem('a'), '1')
        localStorageAdapter.removeItem('a')
        assert.equal(localStorageAdapter.getItem('a'), null)
    })

    it('handles localStorage errors gracefully', () => {
        globalThis.localStorage = {
            getItem: () => {
                throw new Error('fail')
            },
            setItem: () => {
                throw new Error('fail')
            },
            removeItem: () => {
                throw new Error('fail')
            }
        }
        assert.equal(localStorageAdapter.getItem('a'), null)
        assert.doesNotThrow(() => localStorageAdapter.setItem('a', '1'))
        assert.doesNotThrow(() => localStorageAdapter.removeItem('a'))
    })
})

