import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import './app.css'
import Navbar from './components/Navbar'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Collections from './pages/Collections.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Footer from './components/Footer.jsx'
import Register from './pages/Register.jsx'
import Cart from './pages/Cart.jsx'
import Admin from './pages/AdminDashboard.jsx'
import AuthGuard from './auth/AuthGuard.jsx'

const SEED_PRODUCTS = [
  {
    id: 1,
    name: 'Rolex Submariner',
    description: 'A timeless diver\'s icon with enduring character.',
    price: 12500,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    collection: 'rolex',
    badge: 'Signature',
  },
  {
    id: 2,
    name: 'Omega Seamaster',
    description: 'Sport-ready precision built for everyday resilience.',
    price: 980,
    imageUrl:
      'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80',
    collection: 'omega',
    badge: 'New',
  },
  {
    id: 3,
    name: 'Patek Philippe Calatrava',
    description: 'A discreet statement crafted for collectors.',
    price: 3200,
    imageUrl:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
    collection: 'patek-philippe',
    badge: 'Limited',
  },
]

function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return p
  if ('imageUrl' in p && 'collection' in p) return p

  const collection =
    p.collection ||
    p.category ||
    (p.brand
      ? p.brand.toLowerCase().includes('patek')
        ? 'patek-philippe'
        : p.brand.toLowerCase().includes('audemars')
          ? 'audemars-piguet'
          : p.brand.toLowerCase().includes('omega')
            ? 'omega'
            : p.brand.toLowerCase().includes('cartier')
              ? 'cartier'
              : p.brand.toLowerCase().includes('rolex')
                ? 'rolex'
                : undefined
      : undefined)

  const imageUrl = p.imageUrl || p.image

  return { ...p, collection, imageUrl }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4008/api/v1'

function isJwtExpired(token) {
  try {
    const parts = String(token).split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload?.exp) return true
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

export function App() {

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('aviaire_products')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProduct)
        }
      } catch {
        // ignore and reseed
      }
    }

    localStorage.setItem('aviaire_products', JSON.stringify(SEED_PRODUCTS))
    return SEED_PRODUCTS
  })



  const [cart, setCart] = useState([])

  useEffect(() => {
    if (!localStorage.getItem('aviaire_products')) {
      localStorage.setItem('aviaire_products', JSON.stringify(SEED_PRODUCTS))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aviaire_products', JSON.stringify(products))
  }, [products])


  const loadCartFromBackend = async () => {
    const tokenKey = 'aviaire_auth_token'
    let token = localStorage.getItem(tokenKey)
    if (token && isJwtExpired(token)) {
      localStorage.removeItem(tokenKey)
      token = null
    }
    if (!token) return


    const res = await fetch(`${API_BASE}/cart`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // If backend returns non-JSON, avoid crashing JSON.parse
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Failed to load cart')


    const items = data?.data?.items || data?.items || []
    const normalized = items.map((x) => {
      // If backend populates, x.productId is the populated Product doc
      if (x?.productId && typeof x.productId === 'object') {
        return {
          id: x.productId._id?.toString?.() || x.productId._id,
          name: x.productId.name,
          imageUrl: x.productId.imageUrl,
          collection: x.productId.collection,
          price: x.productId.price,
          qty: x.qty ?? x.quantity ?? 1,
        }
      }

      // Fallback when backend isn't populated
      return {
        id: x.productId?._id?.toString?.() || x.productId || x._id,
        
        name: x.name,
        imageUrl: x.imageUrl,
        collection: x.collection,
        price: x.price,
        qty: x.qty ?? x.quantity ?? 1,
      }
    })

    setCart(normalized)
  }

  const getAuthInfoFromToken = () => {
    const tokenKey = 'aviaire_auth_token'
    const token = localStorage.getItem(tokenKey)
    if (!token) return null
    if (isJwtExpired(token)) return null

    try {
      const parts = String(token).split('.')
      if (parts.length !== 3) return null
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      return { id: payload?.id, email: payload?.email }
    } catch {
      return null
    }
  }

  const authInfo = getAuthInfoFromToken()

  useEffect(() => {
    const success = localStorage.getItem('aviaire_login_success')
    if (success) {
      localStorage.removeItem('aviaire_login_success')
      // simple alert; can be swapped for a toast later
      const name = authInfo?.email || 'User'
      alert(`Logged in successfully as ${name}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadProductsAndCart = async () => {
      // 1) Load products (for consistent Mongo ids in UI)
      try {
        const res = await fetch(`${API_BASE}/products`, { method: 'GET' })
        const data = await res.json().catch(() => null)
        if (res.ok && Array.isArray(data?.data) && data.data.length > 0) {
          const normalized = data.data.map(normalizeProduct)
          setProducts(normalized)
          localStorage.setItem('aviaire_products', JSON.stringify(normalized))
        }
      } catch {
        // ignore and keep cached/seeded products
      }

      // 2) Always attempt to load cart from backend if token exists
      await loadCartFromBackend().catch(() => {})
    }

    loadProductsAndCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



  const addToCart = async (product) => {
    const tokenKey = 'aviaire_auth_token'
    let token = localStorage.getItem(tokenKey)
    if (token && isJwtExpired(token)) {
      localStorage.removeItem(tokenKey)
      token = null
    }


    if (!token) {
      // If user isn't logged in, we can't persist to MongoDB.
      // We'll keep local in-memory cart only for current session.
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          )
        }
        return [...prev, { ...product, qty: 1 }]
      })
      return
    }


    // Backend expects Mongo product _id in `productId`.
    // Seed/seeded UI ids are numeric (1/2/3) and do NOT exist in Mongo.
    // So if we only have a numeric id, map it to the backend product's _id.
    const backendProductId = product?._id
      ? product._id
      : (() => {
          const numericId = product?.id
          if (numericId === undefined || numericId === null) return undefined
          const match = products.find((p) => p?.id === numericId && p?._id)
          return match?._id
        })()

    if (!backendProductId) {
      // Fallback: if user clicks before backend products load, still allow cart locally.
      // Also prevents hard failure when product object has only a numeric seed id.
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          )
        }
        return [...prev, { ...product, qty: 1 }]
      })
      return
    }

    const body = {
      productId: backendProductId,
      quantity: 1,
    }



    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    // In case backend returns non-JSON on errors
    let data
    try {
      data = await res.json()
    } catch {
      data = null
    }

    if (!res.ok) {
      throw new Error(data?.message || `Failed to add to cart (HTTP ${res.status})`)
    }


    await loadCartFromBackend()
  }

  const removeFromCart = async (id) => {
    const tokenKey = 'aviaire_auth_token'
    let token = localStorage.getItem(tokenKey)
    if (token && isJwtExpired(token)) {
      localStorage.removeItem(tokenKey)
      token = null
    }


    if (!token) {
      setCart((prev) => prev.filter((item) => item.id !== id))
      return
    }

    const res = await fetch(`${API_BASE}/cart/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: id }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Failed to remove from cart')

    await loadCartFromBackend()
  }

  const updateCartQty = async (id, qty) => {
    if (qty < 1) {
      await removeFromCart(id)
      return
    }

    const tokenKey = 'aviaire_auth_token'
    let token = localStorage.getItem(tokenKey)
    if (token && isJwtExpired(token)) {
      localStorage.removeItem(tokenKey)
      token = null
    }


    if (!token) {
      setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)))
      return
    }

    const res = await fetch(`${API_BASE}/cart/quantity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: id, quantity: qty }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Failed to update cart quantity')

    await loadCartFromBackend()
  }

  return (
    <BrowserRouter>
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
        isLoggedIn={!!authInfo}
        userEmail={authInfo?.email || null}
        onLogout={() => {
          localStorage.removeItem('aviaire_auth_token')
          localStorage.removeItem('aviaire_auth_role')
          window.location.href = '/'
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections" element={<Collections products={products} addToCart={addToCart} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/cart"
          element={
            <AuthGuard requireAuth>
              <Cart cart={cart} removeFromCart={removeFromCart} updateCartQty={updateCartQty} />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard requireAdmin>
              <Admin products={products} setProducts={setProducts} />
            </AuthGuard>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
