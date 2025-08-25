import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/input'
import './components/list'
import './components/counter'

@customElement('todo-app')
export class TodoApp extends LitElement {
    render() {
        return html`
            <todo-counter></todo-counter>
            <todo-input></todo-input>
            <todo-list></todo-list>
        `
    }
}
