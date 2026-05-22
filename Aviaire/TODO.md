# Aviaire - Performance Fix Task

- [ ] Parallelize initial loads in `src/app.jsx` (products + cart via Promise.allSettled)
- [ ] Reduce worst-case request timeout in `src/services/apiClient.js` (shorter than 15000ms)
- [ ] Add lightweight timing logs in `src/services/apiClient.js`
- [ ] Ensure cart qty/actions remain responsive (avoid blocking UI on reloads)
- [ ] Run dev server and manually test cart flows

