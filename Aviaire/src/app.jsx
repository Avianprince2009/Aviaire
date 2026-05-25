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
import Checkout from './pages/Checkout.jsx'
import Admin from './pages/AdminDashboard.jsx'
import AuthGuard from './auth/AuthGuard.jsx'
import { getJson, postJson } from './services/apiClient'

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

    const data = await getJson('cart', { headers: { Authorization: `Bearer ${token}` } })

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

  // Debounce backend cart refresh to keep UI snappy on rapid clicks.
  const cartRefreshTimerRef = React.useRef(null)
  const scheduleCartRefresh = (delayMs = 500) => {
    if (cartRefreshTimerRef.current) {
      window.clearTimeout(cartRefreshTimerRef.current)
    }
    cartRefreshTimerRef.current = window.setTimeout(() => {
      loadCartFromBackend().catch(() => {})
      cartRefreshTimerRef.current = null
    }, delayMs)
  }

  const upsertLocalCartItem = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const [cartSyncInFlight, setCartSyncInFlight] = useState(false)

  // Prevent race conditions + avoid spamming backend with full cart refetches.
  const cartMutationSeqRef = React.useRef(0)
  const lastCartRequestSeqRef = React.useRef(0)
  const syncScheduledRef = React.useRef(false)

  const scheduleCartSyncOnce = (delayMs = 350) => {
    // If a sync is already scheduled, don't schedule another.
    if (syncScheduledRef.current) return
    syncScheduledRef.current = true

    if (cartRefreshTimerRef.current) {
      window.clearTimeout(cartRefreshTimerRef.current)
    }

    cartRefreshTimerRef.current = window.setTimeout(() => {
      syncScheduledRef.current = false

      // Only the latest mutation should trigger a refresh.
      const seq = cartMutationSeqRef.current
      lastCartRequestSeqRef.current = seq

      setCartSyncInFlight(true)
      loadCartFromBackend()
        .catch(() => {})
        .finally(() => {
          // Avoid clearing the in-flight flag if a newer mutation has happened.
          if (lastCartRequestSeqRef.current === seq) {
            setCartSyncInFlight(false)
          }
        })
    }, delayMs)
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

  const [authInfo, setAuthInfo] = useState(getAuthInfoFromToken())

  useEffect(() => {
    const authChangeHandler = () => {
      setAuthInfo(getAuthInfoFromToken())
    }

    window.addEventListener('authChange', authChangeHandler)
    return () => window.removeEventListener('authChange', authChangeHandler)
  }, [])

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
      // Run both requests in parallel to keep the UI responsive.
      const productsPromise = (async () => {
        try {
          const data = await getJson('products').catch(() => null)
          if (Array.isArray(data?.data) && data.data.length > 0) {
            const normalized = data.data.map(normalizeProduct)
            setProducts(normalized)
            localStorage.setItem('aviaire_products', JSON.stringify(normalized))
          }
        } catch {
          // ignore and keep cached/seeded products
        }
      })()

      const cartPromise = loadCartFromBackend().catch(() => {})

      await Promise.allSettled([productsPromise, cartPromise])
    }


    loadProductsAndCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const [cartModal, setCartModal] = useState({ open: false, message: '' })

  const showAddedToCartModal = (message = 'Added to cart') => {
    setCartModal({ open: true, message })
    window.setTimeout(() => {
      setCartModal((prev) => ({ ...prev, open: false }))
    }, 1400)
  }


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
      showAddedToCartModal('Added to cart')
      return
    }

    if (!token) {
      showAddedToCartModal('Added to cart')
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

    // Optimistic UI: update cart instantly; sync with backend in background.
    upsertLocalCartItem({
      ...product,
      // Ensure local item id matches backend id so subsequent updates/removals line up.
      id: backendProductId,
      price: product?.price ?? product?.unitPrice,
    })
    showAddedToCartModal('Added to cart')

    try {
      await postJson('cart/add', body, { headers: { Authorization: `Bearer ${token}` } })
      scheduleCartRefresh(500)
    } catch (err) {
      // Re-sync to recover if backend rejects the optimistic change.
      console.error('Failed to add to cart (backend):', err)
      scheduleCartRefresh(500)
    }

  }

  const removeFromCart = async (id) => {
    const tokenKey = 'aviaire_auth_token'
    let token = localStorage.getItem(tokenKey)
    if (token && isJwtExpired(token)) {
      localStorage.removeItem(tokenKey)
      token = null
    }

    // Optimistic UI first.
    setCart((prev) => prev.filter((item) => item.id !== id))

    if (!token) return

    // Coalesce backend cart syncs.
    cartMutationSeqRef.current += 1
    const seqAtStart = cartMutationSeqRef.current

    // Fire-and-forget; UI is already updated.
    postJson('cart/remove', { productId: id }, { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => {
        // If backend fails, re-sync from backend to recover.
        loadCartFromBackend().catch(() => {})
      })
      .finally(() => {
        scheduleCartSyncOnce(350)
      })
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

    // Optimistic UI first.
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)))

    if (!token) return

    // Coalesce backend cart syncs.
    cartMutationSeqRef.current += 1
    const seqAtStart = cartMutationSeqRef.current

    postJson(
      'cart/quantity',
      { productId: id, quantity: qty },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .catch(() => {
        if (lastCartRequestSeqRef.current !== seqAtStart) {
          loadCartFromBackend().catch(() => {})
        } else {
          scheduleCartSyncOnce(0)
        }
      })
      .finally(() => {
        scheduleCartSyncOnce(350)
      })
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
          path="/checkout"
          element={
            <AuthGuard requireAuth>
              <Checkout cart={cart} />
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
      {cartModal.open && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setCartModal({ open: false, message: '' })}
          />
          <div className="relative w-[92%] max-w-md rounded-2xl border border-[#C9A961]/25 bg-[#0b0b0b]/90 backdrop-blur-xl shadow-2xl shadow-black/60 p-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#C9A961]/15 border border-[#C9A961]/30 flex items-center justify-center">
              <i className="fa fa-check text-[#C9A961] text-2xl" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-center text-xl font-serif font-light text-white">
              {cartModal.message}
            </h3>
            <p className="mt-2 text-center text-xs tracking-widest uppercase text-zinc-400">
              Aviaire
            </p>
          </div>
        </div>
      )}

      <Footer />
    </BrowserRouter>
  )
}

