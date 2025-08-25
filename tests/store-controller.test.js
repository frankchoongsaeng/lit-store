import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createStore, shallow } from '../dist/lib/store.js'
import { StoreController } from '../dist/lib/store-controller.js'

const flush = () => new Promise(res => setTimeout(res, 0))

class Host {
    constructor() {
        this.controllers = []
        this.updateCount = 0
    }
    addController(c) {
        this.controllers.push(c)
    }
    requestUpdate() {
        this.updateCount++
    }
}

describe('StoreController', () => {
    it('subscribes to single selector and updates host', async () => {
        const store = createStore({ a: 0 })
        const host = new Host()
        const controller = new StoreController(host, store, s => s.a)
        assert.equal(controller.value, 0)
        controller.hostConnected()
        store.setState({ a: 1 })
        await flush()
        assert.equal(host.updateCount, 1)
        controller.hostDisconnected()
        store.setState({ a: 2 })
        await flush()
        assert.equal(host.updateCount, 1)
        assert.equal(host.controllers.length, 1)
    })

    it('supports struct selectors with per-field equality', async () => {
        const store = createStore({ a: 0, obj: { x: 1 } })
        const host = new Host()
        const controller = new StoreController(host, store, { a: s => s.a, obj: s => s.obj }, { obj: shallow })
        controller.hostConnected()
        store.setState({ a: 1 })
        await flush()
        assert.equal(host.updateCount, 1)
        store.setState({ obj: { x: 1 } })
        await flush()
        assert.equal(host.updateCount, 1) // shallow equal -> no update
        store.setState({ obj: { x: 2 } })
        await flush()
        assert.equal(host.updateCount, 2)
        assert.deepEqual(controller.value, { a: 1, obj: { x: 2 } })
    })
})

