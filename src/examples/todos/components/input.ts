import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { actions } from '../state'

@customElement('todo-input')
export class TodoInput extends LitElement {
    static styles = css`
        input {
            padding: 0.5rem;
        }
        button {
            margin-left: 0.5rem;
            padding: 0.5rem 0.75rem;
        }
    `

    private value = ''

    render() {
        return html`
            <input
                .value=${this.value}
                @input=${(e: InputEvent) => (this.value = (e.target as HTMLInputElement).value)}
                placeholder="Add todo"
            />
            <button @click=${this.add}>Add</button>
        `
    }

    private add() {
        const text = this.value.trim()
        if (text) {
            actions.add(text)
            this.value = ''
            this.requestUpdate()
        }
    }
}
