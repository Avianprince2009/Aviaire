import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan'
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
  })
)

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
app.post('/api/v1/reset-password', (req, res) => {
  res.json({ message: 'Password updated' })
})

// Products routes (CRUD subset) - focused on PUT /:id
app.put('/api/v1/products/:id', async (req, res, next) => {
  const { id } = req.params || {}
  const payload = req.body || {}

  try {
    // Validate id
    if (!id) return res.status(400).json({ message: 'Product id is required' })
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product id' })

    // Basic payload validation
    const { name, collection, price, imageUrl, description } = payload
    if (!name || !collection || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, collection, price' })
    }

    // Attempt update
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, collection, price: Number(price), imageUrl, description },
      { new: true, runValidators: true }
    )

    if (!updated) return res.status(404).json({ message: 'Product not found' })

    return res.json({ data: updated })
  } catch (err) {
    console.error('PUT /api/v1/products/:id error', { params: req.params, body: req.body, err })
    // If mongoose validation error
    if (err.name === 'ValidationError') return res.status(422).json({ message: err.message, errors: err.errors })
    next(err)
  }
})

// Minimal GET for listing and single product
app.get('/api/v1/products', async (req, res, next) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 }).limit(200)
    res.json({ data: list })
  } catch (err) {
    next(err)
  }
})

app.get('/api/v1/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' })
    const doc = await Product.findById(id)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json({ data: doc })
  } catch (err) {
    next(err)
  }
})

// Cart routes (keep simple)
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
  console.error('Unhandled error:', err)
  if (err instanceof Error && /CORS/.test(err.message)) {
    return res.status(403).json({ message: 'CORS blocked this request' })
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
