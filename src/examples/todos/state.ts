import { createStore } from '../../lib/store'

export type Todo = { id: number; text: string; done: boolean }
export interface TodosState { todos: Todo[] }

export const todosStore = createStore<TodosState>({ todos: [] })

export const actions = {
    add(text: string) {
        const todo: Todo = { id: Date.now(), text, done: false }
        todosStore.setState(s => ({ todos: [...s.todos, todo] }), 'todos/add')
    },
    toggle(id: number) {
        todosStore.setState(
            s => ({ todos: s.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)) }),
            'todos/toggle'
        )
    },
    remove(id: number) {
        todosStore.setState(s => ({ todos: s.todos.filter(t => t.id !== id) }), 'todos/remove')
    }
}
