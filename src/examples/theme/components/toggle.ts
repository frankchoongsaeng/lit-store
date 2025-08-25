import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { StoreController } from '../../../lib/store-controller'
import { actions, themeStore } from '../state'

@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
    static styles = css`
        button {
            padding: 0.5rem 0.75rem;
        }
    `

    theme = new StoreController(this, themeStore, s => s.theme)

    render() {
        return html`<button @click=${actions.toggle}>Theme: ${this.theme.value}</button>`
    }
}
