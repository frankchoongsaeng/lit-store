import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/decrementer'
import './components/incrementer'
import './components/reset'
import './components/viewer'

@customElement('counter-element')
export class CounterElement extends LitElement {
    render() {
        console.log('main counter element rendered') // This will only log once because we are not subscribed to updates from the store
        return html`
            <viewer-element></viewer-element>
            <decrementer-element></decrementer-element>
            <incrementer-element></incrementer-element>
            <reset-element></reset-element>
        `
    }
}
