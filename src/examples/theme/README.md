# Theme Example

A minimal app that toggles between light and dark themes using **lit-store**.

## Key features
- `createStore` tracks the current theme value.
- An action flips the theme using a functional `setState` call.
- `StoreController` keeps the `theme-toggle` component in sync with store changes.
- User choice is saved with `persist` and `localStorageAdapter` so the theme survives reloads.
