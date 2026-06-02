# TODO - E-commerce Admin Upgrade (Orders Management)

## Plan (approved)
1. **Backend**
   - [ ] Extend `Backend/models/order.model.js` to add admin-updatable order status fields:
     - Order status options: Pending, Processing, Shipped, Delivered, Cancelled
     - Add `orderStatus` (default Pending) and `orderStatusSystem` (string for display/system value)
   - [ ] Create `Backend/controller/order.controller.js` with admin-only handlers:
     - `GET /api/v1/orders` (search by customer name/email, filter by status, pagination)
     - `GET /api/v1/orders/:id` (order details)
     - `PATCH /api/v1/orders/:id/status` (update status)
     - `DELETE /api/v1/orders/:id` (admin deletion)
   - [ ] Create `Backend/router/order.routes.js` wiring routes to controller and protect with `verifyUser` + `requireAdmin`.
   - [ ] Register the new router in `Backend/index.js` under `/api/v1`.

2. **Paystack / Order creation**
   - [ ] Ensure existing `Backend/controller/paystack.controller.js#verify` creates orders with the new default order status fields.
   - [ ] Confirm cart clearing still happens after order save (already looks correct).

3. **Frontend**
   - [ ] Add `Aviaire/Aviaire/src/pages/AdminOrders.jsx`:
     - Orders table
     - Search by name/email
     - Status filter
     - Pagination
     - Order details modal/page
     - Status update dropdown
   - [ ] Update `Aviaire/Aviaire/src/pages/AdminDashboard.jsx` to include an Orders tab/section and keep existing Products CRUD unchanged.
   - [ ] Add/adjust any shared API calls in `Aviaire/Aviaire/src/services/apiClient.js` usage patterns if needed.

4. **Validation / Testing**
   - [ ] Run backend and test admin login + load orders.
   - [ ] Verify status update persists to MongoDB and reflects immediately.
   - [ ] Verify delete order endpoint works.
   - [ ] Verify Paystack payment flow results in MongoDB order records.


