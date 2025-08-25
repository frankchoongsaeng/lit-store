import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createStore, shallow } from '../dist/lib/store.js'

const flush = () => new Promise(res => setTimeout(res, 0))

describe('shallow', () => {
    it('returns true for same reference', () => {
        const obj = { a: 1 }
        assert.equal(shallow(obj, obj), true)
    })

    it('returns true for shallow equal objects', () => {
        assert.equal(shallow({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
    })

    it('returns false for different structures', () => {
        assert.equal(shallow({ a: 1 }, { a: 2 }), false)
        assert.equal(shallow({ a: 1 }, { a: 1, b: 2 }), false)
    })

    it('returns false when either argument is not an object', () => {
        assert.equal(shallow(null, {}), false)
    })
})

describe('createStore', () => {
    it('gets and sets state', async () => {
        const store = createStore({ count: 0 })
        assert.deepEqual(store.getState(), { count: 0 })
        const calls = []
        const unsub = store.subscribe(s => s.count)((next, prev) => calls.push([next, prev]))
        store.setState({ count: 1 })
        await flush()
        assert.deepEqual(store.getState(), { count: 1 })
        assert.deepEqual(calls, [[0, 0], [1, 0]])
        unsub()
    })

    it('supports functional updater', async () => {
        const store = createStore({ n: 1 })
        store.setState(s => ({ n: s.n + 1 }))
        await flush()
        assert.deepEqual(store.getState(), { n: 2 })
    })

    it('batches notifications within a microtask', async () => {
        const store = createStore({ a: 0 })
        let calls = 0
        store.subscribe(s => s.a)(() => calls++)
        store.setState({ a: 1 })
        store.setState({ a: 2 })
        await flush()
        assert.equal(calls, 2) // initial + one batched update
    })

    it('allows custom equality in subscribe', async () => {
        const store = createStore({ obj: { x: 1 } })
        let calls = 0
        store.subscribe(s => s.obj, shallow)(() => calls++)
        store.setState({ obj: { x: 1 } })
        await flush()
        assert.equal(calls, 1) // only initial call
    })

    it('subscribeAll receives state changes', async () => {
        const store = createStore({ a: 0 })
        const events = []
        store.subscribeAll((s, prev) => events.push([s.a, prev.a]))
        store.setState({ a: 1 })
        await flush()
        assert.deepEqual(events, [[0, 0], [1, 0]])
    })

    it('destroy removes all subscribers', async () => {
        const store = createStore({ a: 0 })
        let calls = 0
        store.subscribe(s => s.a)(() => calls++)
        store.destroy()
        store.setState({ a: 1 })
        await flush()
        assert.equal(calls, 1) // initial call only
    })

    it('__rehydrate replaces state', () => {
        const store = createStore({ a: 1 })
        store.__rehydrate?.({ a: 5 })
        assert.deepEqual(store.getState(), { a: 5 })
    })
})

