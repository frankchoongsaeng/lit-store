// devtools.ts
import type { Store } from '../lib/store'

type ReduxDevtools = {
    connect(opts: { name?: string }): {
        init(state: any): void
        send(action: any, state: any): void
    }
}

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
