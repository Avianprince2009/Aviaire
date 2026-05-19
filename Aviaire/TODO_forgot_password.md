# TODO - Forgot Password (Email OTP)

## Backend
- [ ] Add `forgotPassword` controller (generate OTP, store in `Otp`, send via nodemailer, generic response)
- [ ] Add `resetPassword` controller (validate input, verify OTP + 10 min expiry, hash + update password, delete OTP)
- [ ] Add routes in `Backend/router/user.routes.js`: `POST /forgot-password`, `POST /reset-password`

## Frontend
- [ ] Create `Aviaire/Aviaire/src/pages/ForgotPassword.jsx` with 2-step flow
- [ ] Add link/button in `Aviaire/Aviaire/src/pages/Login.jsx` to `/forgot-password`
- [ ] Add route in `Aviaire/Aviaire/src/app.jsx` for `/forgot-password`

## Verification
- [ ] Ensure nodemailer env vars are set in Backend `.env`
- [ ] Test end-to-end: request OTP → submit OTP + reset password → login

