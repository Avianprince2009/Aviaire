import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../services/apiClient'
import { authStore } from '../auth/authStore'

const Checkout = ({ cart = [] }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    country: '',
    postalCode: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [error, setError] = useState(null)

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [cart])

  const itemsCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const required = ['fullName', 'email', 'address1', 'city', 'country', 'postalCode']
    for (const key of required) {
      if (!String(form[key] || '').trim()) {
        return `Missing ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email'

    return null
  }

  const getLoggedInEmail = () => {
    // Prefer logged-in email from JWT payload when available
    try {
      const token = authStore?.getToken?.()
      if (token) {
        const parts = String(token).split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
          if (payload?.email) return payload.email
        }
      }
    } catch {
      // ignore
    }
    return form.email
  }

  const clearClientCart = () => {
    // keep cart clearing ONLY on successful verification (done in OrderSuccess)

    try {
      localStorage.removeItem('cart')
      localStorage.removeItem('cartItems')
      sessionStorage.removeItem('cart')
      sessionStorage.removeItem('cartItems')
    } catch {
      // ignore
    }
  }

  const saveShippingInfo = () => {
    try {
      localStorage.setItem(
        'aviaire_shipping_info',
        JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
        })
      )
    } catch {
      // ignore storage failures
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!cart || cart.length === 0) {
      setError('Your cart is empty.')
      return
    }

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const emailForPaystack = getLoggedInEmail()
    const reference = `AV-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

    setSubmitting(true)
    saveShippingInfo()

    try {
      console.log('[Checkout] Initializing Paystack payment...')
      const initResp = await postJson('/paystack/initialize', {
        reference,
        amountKobo: Math.round(Number(total) * 100),
        currency: 'NGN',
        email: emailForPaystack,
        shippingInfo: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
        },
      })

      const authorizationUrl = initResp?.data?.authorizationUrl
      if (!authorizationUrl) {
        throw new Error('Failed to initialize Paystack checkout. Please try again.')
      }

      window.location.assign(authorizationUrl)
    } catch (err) {
      setError(err?.message || 'Payment initialization failed.')
      setSubmitting(false)
    }
  }

  // If your Paystack flow returns to the app with reference, you'd typically verify here.
  // This implementation assumes checkout redirect either completes server-side via verify callback on user return
  // OR you handle return/redirect separately. For now, verify is only triggered from the success page.

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#C9A961]/5 flex items-center justify-center mb-6">
            <i className="fa fa-shopping-bag text-[#C9A961]/30 text-3xl" />
          </div>
          <h1 className="text-2xl font-serif font-light text-[#C9A961]">Your cart is empty</h1>
          <p className="mt-3 text-sm text-zinc-400">Add items from our collections to proceed.</p>
          <Link
            to="/collections"
            className="mt-8 inline-block px-8 py-3 bg-[#C9A961] text-black rounded-lg hover:bg-[#b89852] transition-all"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C9A961] text-center tracking-wide mb-4">
          Checkout
        </h1>
        <p className="max-w-2xl mx-auto mb-10 text-sm text-center text-zinc-400 md:text-base">
          Complete your details to place your order.
        </p>

        {error && (
          <div className="px-4 py-3 mb-6 text-red-200 border rounded-lg border-red-400/30 bg-red-500/10">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 md:p-8 rounded-xl">
            <h2 className="mb-4 text-xl font-light text-white">Shipping Details</h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs tracking-wider uppercase text-zinc-500">Full Name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase text-zinc-500">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase text-zinc-500">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                  placeholder="(optional)"
                />
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase text-zinc-500">Address</label>
                <input
                  name="address1"
                  value={form.address1}
                  onChange={onChange}
                  className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs tracking-wider uppercase text-zinc-500">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                  />
                </div>

                <div>
                  <label className="text-xs tracking-wider uppercase text-zinc-500">Postal Code</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={onChange}
                    className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase text-zinc-500">Country</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={onChange}
                  className="mt-2 w-full bg-black/30 border border-zinc-800/60 rounded-lg px-3 py-3 outline-none focus:border-[#c9a961]/50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || verifyingPayment}
                className="w-full bg-[#C9A961] text-black py-4 rounded-lg font-medium hover:bg-[#b89852] transition-all uppercase tracking-wider text-sm disabled:opacity-60"
              >
                <i className="mr-2 fa fa-lock" />
                {submitting || verifyingPayment ? 'Redirecting to Paystack...' : `Place Order (${total.toLocaleString()})`}
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full bg-transparent border border-[#c9a961]/30 text-white py-3 rounded-lg font-medium hover:border-[#c9a961]/50 transition-all uppercase tracking-wider text-sm"
              >
                Back to Cart
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 md:p-8 rounded-xl">
            <h2 className="mb-4 text-xl font-light text-white">Order Summary</h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border bg-black/20 border-zinc-800/50 rounded-xl"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-cover w-16 h-16 bg-white rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-zinc-800 text-zinc-400">
                      <i className="fa fa-box" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-[#c9a961] font-light">{item.name}</p>
                        <p className="mt-1 text-xs tracking-wider uppercase text-zinc-500">{item.collection}</p>
                      </div>
                      <p className="text-sm text-white/90">${Number(item.price * item.qty).toLocaleString()}</p>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">Qty: {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#c9a961]/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Total Items</p>
                <p className="text-sm text-white/90">{itemsCount}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-zinc-400">Grand Total</p>
                <p className="text-2xl font-light text-white">
                  <span className="text-[#c9a961]">$</span>{total.toLocaleString()}
                </p>
              </div>

              <p className="mt-4 text-xs text-zinc-600">
                Paystack secure checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

