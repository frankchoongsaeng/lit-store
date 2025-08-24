// store.ts
export type StateObject = Record<string, any>
export type PartialState<S> = Partial<S> | ((s: S) => Partial<S>)
export type EqualityFn<T> = (a: T, b: T) => boolean

export interface Store<S extends StateObject> {
    getState(): S
    setState(updater: PartialState<S>, action?: string): void
    subscribe<T>(selector: (s: S) => T, equality?: EqualityFn<T>): (cb: (slice: T, prevSlice: T) => void) => () => void
    subscribeAll(cb: (s: S, prev: S) => void): () => void
    destroy(): void
    // Devtools hook (optional; set by middleware)
    __notifyAction?(type: string, payload?: any): void
}

type Subscriber<S, T> = {
    selector: (s: S) => T
    equality: EqualityFn<T>
    last: T
    cbs: Set<(slice: T, prevSlice: T) => void>
}

const is = Object.is
export const shallow: EqualityFn<any> = (a, b) => {
    if (is(a, b)) return true
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    for (const k of ka) if (!is(a[k], (b as any)[k])) return false
    return true
}

export function createStore<S extends StateObject>(initial: S): Store<S> {
    let state = initial
    let prevState = state
    const subs = new Set<Subscriber<S, any>>()
    const allSubs = new Set<(s: S, prev: S) => void>()

    // microtask batching
    let pending = false
    function scheduleNotify() {
        if (pending) return
        pending = true
        queueMicrotask(() => {
            pending = false
            const snap = state
            const prev = prevState
            // Notify specific-slice subscribers
            for (const sub of subs) {
                const nextSlice = sub.selector(snap)
                if (!sub.cbs.size) continue
                if (!sub.equality(nextSlice, sub.last)) {
                    const old = sub.last
                    sub.last = nextSlice
                    for (const cb of sub.cbs) cb(nextSlice, old)
                }
            }
            // Notify "all" subscribers
            for (const cb of allSubs) cb(snap, prev)
            prevState = snap
        })
    }

    function getState() {
        return state
    }

    function setState(updater: PartialState<S>, action?: string) {
        const patch = typeof updater === 'function' ? (updater as any)(state) : updater
        const next = { ...state, ...patch }
        if (is(next, state)) return
        state = next
        if (store.__notifyAction && action) store.__notifyAction(action, patch)
        scheduleNotify()
    }

    function subscribe<T>(selector: (s: S) => T, equality: EqualityFn<T> = is) {
        // Create (or reuse) a subscriber bucket keyed by selector+equality
        const sub: Subscriber<S, T> = {
            selector,
            equality,
            last: selector(state),
            cbs: new Set()
        }

        subs.add(sub)

        return (cb: (slice: T, prevSlice: T) => void) => {
            sub.cbs.add(cb)
            // Fire immediately with current slice
            cb(sub.last, sub.last)
            return () => {
                sub.cbs.delete(cb)
                if (sub.cbs.size === 0) subs.delete(sub)
            }
        }
    }

    function subscribeAll(cb: (s: S, prev: S) => void) {
        allSubs.add(cb)
        cb(state, state)
        return () => allSubs.delete(cb)
    }

    function destroy() {
        subs.clear()
        allSubs.clear()
    }

    const store: Store<S> = { getState, setState, subscribe, subscribeAll, destroy }
    return store
}

// Optional: run multiple state updates without intermediate subscriber work
export function batch(fn: () => void) {
    // call-site can rely on microtask coalescing already; batch is semantic sugar
    fn()
}
