import { createStore } from '../../lib/store'

export type CounterState = { count: number }
export const counterStore = createStore<CounterState>({ count: 0 })

export const actions = {
    inc(n = 1) {
        counterStore.setState(s => ({ count: s.count + n }), 'counter/inc')
    },
    dec(n = 1) {
        counterStore.setState(s => ({ count: s.count - n }), 'counter/dec')
    },
    reset() {
        counterStore.setState({ count: 0 }, 'counter/reset')
    }
}
