import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { todosStore } from '../state'
import { StoreController } from '../../../lib/store-controller'

@customElement('todo-counter')
export class TodoCounter extends LitElement {
    stats = new StoreController(this, todosStore, {
        total: s => s.todos.length,
        remaining: s => s.todos.filter(t => !t.done).length
    })

    render() {
        const { total, remaining } = this.stats.value
        return html`<div>${remaining} / ${total} remaining</div>`
    }
}
