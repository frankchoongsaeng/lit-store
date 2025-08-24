// persist.ts
import type { Store } from './store'

export type PersistAdapter = {
    getItem(key: string): Promise<string | null> | string | null
    setItem(key: string, value: string): Promise<void> | void
    removeItem?(key: string): Promise<void> | void
}

export type PersistOptions<S> = {
    key: string
    adapter: PersistAdapter
    version?: number
    migrate?: (oldState: any, oldVersion: number) => S
    partialize?: (s: S) => any // choose what to save
    onRehydrate?: (s: S) => void
}

export async function persist<S extends Record<string, any>>(store: Store<S>, opts: PersistOptions<S>) {
    const { key, adapter, version = 1, migrate, partialize = s => s, onRehydrate } = opts

    // Rehydrate
    try {
        const raw = await adapter.getItem(key)
        if (raw) {
            const data = JSON.parse(raw) as { v: number; s: any }
            const next = typeof migrate === 'function' && data.v !== version ? migrate(data.s, data.v) : (data.s as S)
            store.setState(() => next, true, '@@persist/rehydrate')
            onRehydrate?.(store.getState())
        }
    } catch (e) {
        // swallow; keep going
        console.warn('[persist] rehydrate failed', e)
    }

    // Save on any change
    store.subscribeAll(s => {
        try {
            const raw = JSON.stringify({ v: version, s: partialize(s) })
            const maybePromise = adapter.setItem(key, raw)
            if (maybePromise instanceof Promise) maybePromise.catch(() => {})
        } catch {}
    })

    return store
}

// Common adapters:
export const localStorageAdapter: PersistAdapter = {
    getItem: k => {
        try {
            return globalThis.localStorage?.getItem(k)
        } catch {
            return null
        }
    },
    setItem: (k, v) => {
        try {
            globalThis.localStorage?.setItem(k, v)
        } catch {}
    },
    removeItem: k => {
        try {
            globalThis.localStorage?.removeItem?.(k)
        } catch {}
    }
}
