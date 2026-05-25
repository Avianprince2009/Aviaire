# Aviaire - Performance Fix Task

- [x] Parallelize initial loads in `src/app.jsx` (products + cart via Promise.allSettled)
- [ ] Reduce worst-case request timeout in `src/services/apiClient.js` (shorter than 15000ms)
- [ ] Add lightweight timing logs in `src/services/apiClient.js`
- [x] Ensure cart qty/actions remain responsive (optimistic UI + debounced backend refresh)
- [ ] Run dev server and manually test cart flows
- [ ] (Later) Inspect backend cart endpoints if still slow under real network

