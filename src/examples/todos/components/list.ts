import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { todosStore, actions } from '../state'
import { StoreController } from '../../../lib/store-controller'

@customElement('todo-list')
export class TodoList extends LitElement {
    static styles = css`
        li {
            list-style: none;
        }
        li.done {
            text-decoration: line-through;
        }
        button {
            margin-left: 0.5rem;
        }
    `

    todos = new StoreController(this, todosStore, s => s.todos)

    render() {
        return html`
            <ul>
                ${this.todos.value.map(
                    t => html`<li class=${t.done ? 'done' : ''}>
                        <input type="checkbox" .checked=${t.done} @change=${() => actions.toggle(t.id)} />
                        ${t.text}
                        <button @click=${() => actions.remove(t.id)}>x</button>
                    </li>`
                )}
            </ul>
        `
    }
}
