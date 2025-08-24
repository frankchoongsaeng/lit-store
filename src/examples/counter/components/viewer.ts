import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { actions, counterStore } from '../state'
import { StoreController } from '../../../lib/store-controller'

@customElement('viewer-element')
export class ViewerElement extends LitElement {
    static styles = css`
        button {
            padding: 0.5rem 0.75rem;
        }
    `

    count = new StoreController(this, counterStore, s => s.count)

    render() {
        console.log('viewer element rendered')
        return html`<div>Count: <span class="count">${this.count.value}</span></div>`
    }
}
