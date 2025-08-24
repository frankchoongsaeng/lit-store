import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { actions } from '../state'

@customElement('reset-element')
export class ResetElement extends LitElement {
    static styles = css`
        button {
            padding: 0.5rem 0.75rem;
        }
    `

    render() {
        console.log('reset element rendered')
        return html` <button @click=${() => actions.reset()}>0</button>`
    }
}
