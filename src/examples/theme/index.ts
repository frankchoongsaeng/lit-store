import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/toggle'

@customElement('theme-app')
export class ThemeApp extends LitElement {
    render() {
        return html`<theme-toggle></theme-toggle>`
    }
}
