# Todos Example

A small todo list demonstrating more advanced **lit-store** usage.

## Key features
- `createStore` manages an array of todo items.
- Actions add, toggle and remove todos through immutable `setState` updates.
- Components subscribe to state with `StoreController` for reactive lists and inputs.
- Derived selectors compute todo statistics (total and remaining) in the `todo-counter` component.
- Connected to Redux DevTools via `withDevtools` for inspection.
- State persistence with `persist` and `localStorageAdapter` retains todos between sessions.
