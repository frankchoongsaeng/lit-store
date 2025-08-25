# Counter Example

Demonstrates a simple counter built with **lit-store**.

## Key features
- `createStore` holds the counter state with an initial `count` of 0.
- Actions update state via `setState` for increment, decrement and reset.
- `StoreController` subscribes the viewer component to the `count` slice so only it re-renders.
- Other components dispatch actions without subscribing to updates, remaining static.
- Integrated with Redux DevTools using `withDevtools` for easy debugging.
- State is persisted across page reloads via `persist` and the `localStorageAdapter`.
