// lit-store-controller.ts
import { ReactiveController, ReactiveControllerHost } from 'lit'

import type { Store, EqualityFn, StateObject } from './store'
import { withDevtools } from '../devtools/redux'

export class StoreController<S extends StateObject, T> implements ReactiveController {
    private host: ReactiveControllerHost
    private store: Store<S>
    private selector: (s: S) => T
    private equality: EqualityFn<T>
    private unsub?: () => void
    private _value!: T

    constructor(host: ReactiveControllerHost, store: Store<S>, selector: (s: S) => T, equality?: EqualityFn<T>) {
        this.host = host
        this.store = withDevtools(store)
        this.selector = selector
        this.equality = equality ?? Object.is
        host.addController(this)
    }

    hostConnected() {
        const add = this.store.subscribe(this.selector, this.equality)
        this.unsub = add((next, prev) => {
            this._value = next
            if (!this.equality(next, prev)) this.host.requestUpdate()
        })
    }

    hostDisconnected() {
        this.unsub?.()
        this.unsub = undefined
    }

    get value() {
        // Ensure first read has a sensible value even before connect
        if (this._value === undefined) {
            this._value = this.selector(this.store.getState())
        }
        return this._value
    }
}
