/**
 * Lit reactive controller that subscribes to a store and exposes selected
 * slices of state to Lit components.
 */
import { ReactiveController, ReactiveControllerHost } from 'lit'
import type { Store, EqualityFn } from './store'
import { StateObject } from './store'

// ---- Types ----

/** Selects a value from state. */
type Selector<S, T> = (s: S) => T

/** Mapping of names to selectors. */
type SelectorMap<S> = Record<string, Selector<S, any>>

/** Mapping of selector names to custom equality functions. */
type EqMap<M extends SelectorMap<any>> = {
    [K in keyof M]?: EqualityFn<ReturnType<M[K]>>
}

/** Object containing the values picked by a struct of selectors. */
type Selected<M extends SelectorMap<any>> = {
    [K in keyof M]: ReturnType<M[K]>
}

// ---- Utilities ----
const is = Object.is

/**
 * Builds an equality function that compares two selector result objects field
 * by field using optional per-field equality functions.
 */
function structEq<M extends SelectorMap<any>>(eqs?: EqMap<M>): EqualityFn<Selected<M>> {
    return (a, b) => {
        if (a === b) return true
        for (const k in a as any) {
            const eq = (eqs?.[k as keyof M] as EqualityFn<any>) ?? is
            if (!eq((a as any)[k], (b as any)[k])) return false
        }
        return true
    }
}

/**
 * Composes a struct of selectors into a single selector that returns an
 * object mapping the same keys to selected values.
 */
function composeStructSelector<S, M extends SelectorMap<S>>(map: M) {
    const entries = Object.entries(map) as [keyof M, (s: S) => any][]
    return (s: S) => {
        const out: any = {}
        for (const [k, sel] of entries) out[k as string] = sel(s)
        return out as Selected<M>
    }
}

/**
 * Reactive controller that keeps a Lit component in sync with selected values
 * from a store. The selected value can be either a single selector or a struct
 * of selectors.
 */
export class StoreController<S extends StateObject, T> implements ReactiveController {
    #host: ReactiveControllerHost
    #store: Store<S>
    #pick: (s: S) => T
    #eq: EqualityFn<T>
    #unsub?: () => void
    #val!: T

    // Overload 1: single selector
    constructor(host: ReactiveControllerHost, store: Store<S>, selector: Selector<S, T>, eq?: EqualityFn<T>)
    // Overload 2: struct of selectors (+ per-field eq map)
    constructor(host: ReactiveControllerHost, store: Store<S>, selectors: SelectorMap<S>, eqs?: EqMap<any>)

    constructor(
        host: ReactiveControllerHost,
        store: Store<S>,
        selectors: Selector<S, any> | SelectorMap<S>,
        eqOrEqs?: EqualityFn<any> | EqMap<any>
    ) {
        this.#host = host
        this.#store = store

        if (typeof selectors === 'function') {
            // Single selector
            this.#pick = selectors as (s: S) => T
            this.#eq = (eqOrEqs as EqualityFn<T>) ?? is
        } else {
            // Struct of selectors
            this.#pick = composeStructSelector(selectors as SelectorMap<S>) as (s: S) => T
            this.#eq = structEq(eqOrEqs as EqMap<any>) as EqualityFn<T>
        }

        host.addController(this)
    }

    /** Start watching the store when the host connects. */
    hostConnected() {
        const add = this.#store.subscribe(this.#pick, this.#eq)
        this.#unsub = add((next, prev) => {
            this.#val = next
            if (!this.#eq(next, prev)) this.#host.requestUpdate()
        })
    }

    /** Stop watching the store when the host disconnects. */
    hostDisconnected() {
        this.#unsub?.()
        this.#unsub = undefined
    }

    /** The current selected value. */
    get value(): T {
        if (this.#val === undefined) this.#val = this.#pick(this.#store.getState())
        return this.#val
    }
}
