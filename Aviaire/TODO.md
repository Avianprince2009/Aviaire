# Aviaire Task TODO

- [x] Inspect checkout + cart flow for Paystack + cart clearing

- [x] Update `Aviaire/src/pages/Checkout.jsx`:
  - [x] Make Paystack popup open reliably on “Place Order” click
  - [x] Clear frontend cart after payment success (call backend checkout endpoint / refresh cart)
  - [x] Ensure UI navigates/re-renders with empty cart

- [ ] Test locally: Paystack popup opens every time; cart clears after success

