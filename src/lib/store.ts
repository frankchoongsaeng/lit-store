// robust-store.ts
export type StateObject = Record<string, any>
export type PartialState<S> = Partial<S> | ((s: S) => Partial<S>)
export type EqualityFn<T> = (a: T, b: T) => boolean

const is = Object.is
export const shallow: EqualityFn<any> = (a, b) => {
    if (is(a, b)) return true
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
    const ka = Object.keys(a),
        kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    for (const k of ka) if (!is(a[k], (b as any)[k])) return false
    return true
}

function memoSelector<S, T>(selector: (s: S) => T) {
    let lastS: S | undefined, lastT: T
    return (s: S) => (s === lastS ? lastT : ((lastS = s), (lastT = selector(s))))
}

type Sub<S, T> = {
    pick: (s: S) => T // memoized selector
    eq: EqualityFn<T>
    last: T
    cbs: Set<(next: T, prev: T) => void>
}

export interface Store<S extends StateObject> {
    getState(): S
    setState(updater: PartialState<S>, action?: string): void
    subscribe<T>(selector: (s: S) => T, eq?: EqualityFn<T>): (cb: (next: T, prev: T) => void) => () => void
    subscribeAll(cb: (s: S, prev: S) => void): () => void
    destroy(): void
    // Optional hooks:
    __notifyAction?(type: string, payload?: any): void
    __rehydrate?(s: S): void
}

export function createStore<S extends StateObject>(initial: S): Store<S> {
    let state = initial
    let prevState = state

    const subs = new Set<Sub<S, any>>()
    const allSubs = new Set<(s: S, prev: S) => void>()

    // microtask batching & reentrancy
    let pending = false
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
