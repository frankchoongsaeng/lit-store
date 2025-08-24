import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { actions } from '../state'

@customElement('incrementer-element')
export class IncrementerElement extends LitElement {
    static styles = css`
        button {
            padding: 0.5rem 0.75rem;
        }
    `

    render() {
        console.log('incrementer element rendered')
        return html` <button @click=${() => actions.inc()}>+</button> `
    }
}
