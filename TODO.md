# TODO - Performance fixes (Aviaire)

## Step 1 (Front-end)
- Optimize cart operations in `Aviaire/src/app.jsx`:
  - Add optimistic UI for `removeFromCart` and `updateCartQty`
  - Debounce/coalesce backend cart refresh so rapid qty clicks only sync once
  - Prevent race conditions with an in-flight/sync-in-progress guard

## Step 2 (Optional Front-end)
- Reduce excessive API logging in `Aviaire/src/services/apiClient.js` (only if it’s slowing dev/prod)

## Step 3 (Verification)
- Test login speed
- Test cart + / - spam behavior
- Test delete behavior

