/**
 * Core store implementation providing reactive state management with
 * structural sharing and microtask batching.
 */

/** Basic record type representing the shape of the store's state. */
export type StateObject = Record<string, any>

/**
 * A partial update to the state or a function producing such an update based
 * on the current state.
 */
export type PartialState<S> = Partial<S> | ((s: S) => Partial<S>)

/** Function used to compare two values for equality. */
export type EqualityFn<T> = (a: T, b: T) => boolean

const is = Object.is

/**
 * Shallow equality check between two objects. Returns `true` if both objects
 * have the same keys with `Object.is`-equal values.
 */
export const shallow: EqualityFn<any> = (a, b) => {
    if (is(a, b)) return true
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
    const ka = Object.keys(a),
        kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    for (const k of ka) if (!is(a[k], (b as any)[k])) return false
    return true
}

/**
 * Memoizes a selector so that it only recomputes when the input state
 * reference changes.
 */
function memoSelector<S, T>(selector: (s: S) => T) {
    let lastS: S | undefined, lastT: T
    return (s: S) => (s === lastS ? lastT : ((lastS = s), (lastT = selector(s))))
}

/**
 * Internal subscription record for a selector.
 */
type Sub<S, T> = {
    /** Memoized selector for the subscription. */
    pick: (s: S) => T
    /** Equality function used to compare selected values. */
    eq: EqualityFn<T>
    /** Last value seen by this subscription. */
    last: T
    /** Set of callbacks registered for this subscription. */
    cbs: Set<(next: T, prev: T) => void>
}

/**
 * Public API for interacting with a store instance.
 */
export interface Store<S extends StateObject> {
    /** Returns the current state. */
    getState(): S
    /** Applies a partial update to the state. */
    setState(updater: PartialState<S>, action?: string): void
    /**
     * Subscribes to a slice of state derived by the provided selector. Returns
     * a function used to add callbacks which are invoked whenever the selected
     * value changes.
     */
    subscribe<T>(selector: (s: S) => T, eq?: EqualityFn<T>): (cb: (next: T, prev: T) => void) => () => void
    /** Subscribes to every state change. */
    subscribeAll(cb: (s: S, prev: S) => void): () => void
    /** Clears all subscriptions. */
    destroy(): void
    // Optional hooks:
    /** Hook used by devtools to observe actions. */
    __notifyAction?(type: string, payload?: any): void
    /** Hook used by persistence utilities to replace the state. */
    __rehydrate?(s: S): void
}

/**
 * Creates a new store with the provided initial state.
 */
export function createStore<S extends StateObject>(initial: S): Store<S> {
    let state = initial
    let prevState = state

    const subs = new Set<Sub<S, any>>()
    const allSubs = new Set<(s: S, prev: S) => void>()

    // microtask batching & reentrancy
    let pending = false
    /**
     * Notify subscribers of state changes. Uses microtask batching to collapse
     * multiple `setState` calls in the same tick into a single notification.
     */
    function notify() {
        if (pending) return
        pending = true
        queueMicrotask(() => {
            pending = false
            const snap = state,
                prev = prevState
            for (const sub of subs) {
                const nextSlice = sub.pick(snap)
                if (!sub.cbs.size) continue
                if (!sub.eq(nextSlice, sub.last)) {
                    const old = sub.last
                    sub.last = nextSlice
                    for (const cb of sub.cbs) cb(nextSlice, old)
                }
            }
            for (const cb of allSubs) cb(snap, prev)
            prevState = snap
        })
    }

    const store: Store<S> = {
        getState: () => state,
        setState: (updater, action) => {
            const patch = typeof updater === 'function' ? (updater as any)(state) : updater
            const next = { ...state, ...patch } // structural sharing
            if (is(next, state)) return
            state = next
            if (store.__notifyAction && action) store.__notifyAction(action, patch)
            notify()
        },
        subscribe: <T>(selector: (s: S) => T, eq: EqualityFn<T> = is) => {
            const pick = memoSelector(selector)
            const sub: Sub<S, T> = { pick, eq, last: pick(state), cbs: new Set() }
            subs.add(sub)
            return (cb: (next: T, prev: T) => void) => {
                sub.cbs.add(cb)
                cb(sub.last, sub.last) // immediate
                return () => {
                    sub.cbs.delete(cb)
                    if (!sub.cbs.size) subs.delete(sub)
                }
            }
        },
        subscribeAll: cb => {
            allSubs.add(cb)
            cb(state, state)
            return () => allSubs.delete(cb)
        },
        destroy: () => {
            subs.clear()
            allSubs.clear()
        }
    }

    // Rehydrate hook (for SSR/persist)
    store.__rehydrate = (s: S) => {
        state = s
        prevState = s
    }

    return store
}
