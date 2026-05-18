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

export function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('aviaire_products')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(normalizeProduct)
          localStorage.setItem('aviaire_products', JSON.stringify(normalized))
          return normalized
        }
      } catch (e) {
        // fall through to reseed
      }
    }

    localStorage.setItem('aviaire_products', JSON.stringify(SEED_PRODUCTS))
    return SEED_PRODUCTS
  })

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('aviaire_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (!localStorage.getItem('aviaire_products')) {
      localStorage.setItem('aviaire_products', JSON.stringify(SEED_PRODUCTS))
    }
    if (!localStorage.getItem('aviaire_cart')) {
      localStorage.setItem('aviaire_cart', JSON.stringify([]))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aviaire_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('aviaire_cart', JSON.stringify(cart))
  }, [cart])

  const loadCartFromBackend = async () => {
    const token = localStorage.getItem('aviaire_auth_token')
    if (!token) return

    const res = await fetch(`${API_BASE}/cart`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Failed to load cart')

    const normalized = (data?.data?.items || data?.items || []).map((x) => ({
      id: x.productId?._id?.toString() || x.productId || x._id,
      name: x.productId?.name || x.name,
      imageUrl: x.productId?.imageUrl || x.imageUrl,
      collection: x.productId?.collection || x.collection,
      price: x.productId?.price ?? x.price,
      qty: x.qty ?? x.quantity ?? 1,
    }))

    setCart(normalized)
  }

  useEffect(() => {
    loadCartFromBackend().catch(() => {})
  }, [])

  const addToCart = async (product) => {
    const token = localStorage.getItem('aviaire_auth_token')

    if (!token) {
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

    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product.id || product._id, quantity: 1 }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Failed to add to cart')

    await loadCartFromBackend()
  }

  const removeFromCart = async (id) => {
    const token = localStorage.getItem('aviaire_auth_token')

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

    const token = localStorage.getItem('aviaire_auth_token')

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
      <Navbar cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections" element={<Collections products={products} addToCart={addToCart} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
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
