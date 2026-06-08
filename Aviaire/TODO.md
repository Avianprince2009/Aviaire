# TODO - Authentication stability fixes (login/register)

- [x] Update `src/services/apiClient.js` to increase/override timeout for `login` and `register` requests.
- [x] Add an in-flight lock to `src/pages/Login.jsx` to prevent overlapping submissions.
- [x] Add an in-flight lock to `src/pages/Register.jsx` to prevent overlapping submissions.
- [x] If needed, make `src/auth/AuthGuard.jsx` rerender on `authChange`.
- [ ] Run frontend lint/build/tests (if available) and manually verify: login succeeds first attempt; register succeeds first attempt; no transient unauth redirects.


