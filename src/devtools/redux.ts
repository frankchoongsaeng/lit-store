/**
 * Integration with the Redux DevTools browser extension.
 */
import type { Store } from '../lib/store'

/** Minimal interface for the Redux DevTools extension. */
type ReduxDevtools = {
    connect(opts: { name?: string }): {
        init(state: any): void
        send(action: any, state: any): void
    }
}

/**
 * Wraps a store to report actions and state changes to the Redux DevTools
 * extension, if present.
 */
export function withDevtools<S extends Record<string, any>>(store: Store<S>, name = 'lit-state') {
    const ext = (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__ as ReduxDevtools | undefined
    if (!ext) return store

    const dev = ext.connect({ name })
    dev.init(store.getState())

    store.__notifyAction = (type, payload) => {
        dev.send({ type, payload }, store.getState())
    }

    // Also track full changes for setState calls without explicit action
    const unsub = store.subscribeAll((s, _prev) => {
        dev.send({ type: '@@setState' }, s)
    })

    // when store.destroy() is called, unsubscribe dev listener
    const origDestroy = store.destroy
    store.destroy = () => {
        unsub()
        origDestroy()
    }

    return store
}
