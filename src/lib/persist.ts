/**
 * Utilities for persisting store state to a storage adapter such as
 * `localStorage`.
 */
import type { Store } from './store'

/** Adapter interface used to read and write serialized state. */
export type PersistAdapter = {
    getItem(key: string): Promise<string | null> | string | null
    setItem(key: string, value: string): Promise<void> | void
    removeItem?(key: string): Promise<void> | void
}

/** Options controlling persistence behaviour. */
export type PersistOptions<S> = {
    /** Storage key used to save the state. */
    key: string
    /** Storage adapter implementation. */
    adapter: PersistAdapter
    /** Version number to detect migrations. */
    version?: number
    /** Function used to migrate old state when versions mismatch. */
    migrate?: (oldState: any, oldVersion: number) => S
    /** Selects part of the state to persist. */
    partialize?: (s: S) => any
    /** Called after the state has been rehydrated. */
    onRehydrate?: (s: S) => void
}

/**
 * Persists the store's state using the provided adapter and options. The
 * store is first rehydrated from storage and then any subsequent changes are
 * saved.
 */
export async function persist<S extends Record<string, any>>(store: Store<S>, opts: PersistOptions<S>) {
    const { key, adapter, version = 1, migrate, partialize = s => s, onRehydrate } = opts

    // Rehydrate
    try {
        const raw = await adapter.getItem(key)
        if (raw) {
            const data = JSON.parse(raw) as { v: number; s: any }
            const next = typeof migrate === 'function' && data.v !== version ? migrate(data.s, data.v) : (data.s as S)
            store.setState(() => next, '@@persist/rehydrate')
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
/**
 * Adapter that persists state to `globalThis.localStorage`. It gracefully
 * handles environments where `localStorage` is unavailable.
 */
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
