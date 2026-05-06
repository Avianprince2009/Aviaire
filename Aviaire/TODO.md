# TODO: Add Products to Collections

## Plan
1. Lift product & cart state to `App.jsx` with `localStorage` persistence
2. Update `AdminDashboard.jsx` to receive `products`/`setProducts` via props
3. Rewrite `Collections.jsx` to display products with collection filtering
4. Update `WatchCard.jsx` to make `onDelete` optional and add "Add to Cart"
5. Rewrite `Cart.jsx` to display cart items with totals
6. Seed 5 demo products (one per collection)

## Steps
- [x] Update `src/app.jsx` with shared state + localStorage
- [x] Update `src/pages/AdminDashboard.jsx` with props
- [x] Rewrite `src/pages/Collections.jsx`
- [x] Update `src/components/WatchCard.jsx`
- [x] Rewrite `src/pages/Cart.jsx`

# TODO: Admin Edit Products

## Plan
- Add edit functionality to `AdminDashboard.jsx` without changing the UI

## Steps
- [x] Add `editingId` state to track which product is being edited
- [x] Add `handleEdit` and `handleCancelEdit` functions
- [x] Modify form `onSubmit` to handle update vs create
- [x] Update form header and submit button based on mode
- [x] Add cancel edit button
- [x] Add edit button to each product row
- [x] Update toast message conditionally
- [x] Verify build succeeds

