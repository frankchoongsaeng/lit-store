import { createStore } from '../../lib/store'

export type ThemeState = { theme: 'light' | 'dark' }
export const themeStore = createStore<ThemeState>({ theme: 'light' })

export const actions = {
    toggle() {
        themeStore.setState(
            s => ({ theme: s.theme === 'light' ? 'dark' : 'light' }),
            'theme/toggle'
        )
    }
}
