import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Configure CORS to accept requests from the frontend origin(s)
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'https://aviaire.vercel.app')
  .split(',')
  .map((s) => s.trim())

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: function (origin, cb) {
      // Allow requests with no origin like curl/postman (if needed)
      if (!origin) return cb(null, true)
      if (FRONTEND_ORIGINS.indexOf(origin) !== -1) return cb(null, true)
      cb(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200,
  })
)

// For debugging CORS issues, respond to preflight explicitly (safe no-op)
app.options('*', cors())

// Simple healthcheck
app.get('/api/v1/health', (req, res) => res.json({ ok: true }))

// Example auth routes (replace with your real implementations)
app.post('/api/v1/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' })

  // TODO: replace with real auth; here we return a fake token for demo
  if (email === 'demo@user.com' && password === 'password') {
    return res.json({ token: 'demo.jwt.token' })
  }

  return res.status(401).json({ message: 'Invalid credentials' })
})

app.post('/api/v1/register', (req, res) => {
  // create user; return 201
  res.status(201).json({ message: 'Registered' })
})

app.post('/api/v1/forgot-password', (req, res) => {
  // always respond 200 to avoid leaking user enumeration
  res.json({ message: 'If the email exists, a reset OTP was sent' })
})

app.post('/api/v1/reset-password', (req, res) => {
  res.json({ message: 'Password updated' })
})

// Cart routes (protected in production)
app.get('/api/v1/cart', (req, res) => {
  res.json({ data: { items: [] } })
})

app.post('/api/v1/cart/add', (req, res) => {
  res.json({ message: 'added' })
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' })
})

// Error handler - always return JSON
app.use((err, req, res, next) => {
  console.error(err)
  if (err instanceof Error && /CORS/.test(err.message)) {
    return res.status(403).json({ message: 'CORS blocked this request' })
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
