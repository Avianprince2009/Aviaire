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
import AuthGuard from './auth/AuthGuard'

const SEED_PRODUCTS = [
  {
    id: 1,
    name: "Rolex Submariner",
    description: "A timeless diver’s icon with enduring character.",
    price: 12500,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    brand: "Rolex",
    category: "Diver",
    badge: "Signature",
  },
  {
    id: 2,
    name: "G-Shock Chronograph",
    description: "Sport-ready precision built for everyday resilience.",
    price: 980,
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80",
    brand: "G-Shock",
    category: "Sport",
    badge: "New",
  },
  {
    id: 3,
    name: "L’ALLURE Atelier Watch",
    description: "A discreet statement crafted for collectors.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80",
    brand: "L’ALLURE",
    category: "Atelier",
    badge: "Limited",
  },
]

export function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('aviaire_products')
    if (saved) return JSON.parse(saved)
    localStorage.setItem('aviaire_products', JSON.stringify(SEED_PRODUCTS))
    return SEED_PRODUCTS
  })


  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('aviaire_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    // Ensure storage contains initialized defaults.
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

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateCartQty = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )
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
        <Route path='*' element={<NotFound/>} />

      </Routes>
        <Footer/>
    </BrowserRouter>
  )
}
