// my-counter.ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/decrementer'
import './components/incrementer'
import './components/reset'
import './components/viewer'
import { StoreController } from '../../lib/store-controller'
import { counterStore } from './state'

@customElement('counter-element')
export class CounterElement extends LitElement {
    _count = new StoreController(this, counterStore, s => ({ c: 1 }))
    render() {
        console.log('main counter element rendered')
        return html`
            <viewer-element></viewer-element>
            <decrementer-element></decrementer-element>
            <incrementer-element></incrementer-element>
            <reset-element></reset-element>
        `
    }
}
