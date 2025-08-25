import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { actions, counterStore } from '../state'

@customElement('decrementer-element')
export class DecrementerElement extends LitElement {
    static styles = css`
        button {
            padding: 0.5rem 0.75rem;
        }
    `

    render() {
        console.log('decrementer element rendered') // This will only log once because we are not subscribed to updates from the store
        return html` <button @click=${() => actions.dec()}>-</button> `
    }
}
