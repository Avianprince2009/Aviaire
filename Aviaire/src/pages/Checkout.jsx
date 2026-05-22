import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
    paymentMethod: 'card',
  })

  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [error, setError] = useState(null)

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [cart])

  const itemsCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])

  // Demo checkout: no backend call required for the current fake order flow.


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

    setSubmitting(true)
    try {
      const { postJson } = await import('../services/apiClient.js')

      const payload = {
        ...form,
        // Backend reads cart items from DB; sending cart is optional.
      }

      const resp = await postJson('checkout', payload)
      const data = resp?.data || {}

      setOrderSuccess({
        id: data.orderId,
        placedAt: data.placedAt,
        total: data.total,
      })
    } catch (err) {
      setError(err?.message || 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C9A961] text-center tracking-wide mb-4">
            Order Confirmed
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-sm text-center text-zinc-400 md:text-base">
            This is a demo checkout. No payment was processed.
          </p>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 md:p-8 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-wider uppercase text-zinc-500 mb-2">Order ID</p>
                <p className="text-3xl font-light text-white">
                  <span className="text-[#c9a961]">{orderSuccess.id}</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#C9A961]/15 border border-[#C9A961]/25 flex items-center justify-center">
                <i className="fa fa-check text-[#C9A961] text-2xl" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#c9a961]/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p className="text-sm text-zinc-400">
                  Placed: {new Date(orderSuccess.placedAt).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">Total paid: ${total.toLocaleString()}</p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-[#C9A961] text-black py-3 rounded-lg font-medium hover:bg-[#b89852] transition-all"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
                <button
                  className="flex-1 bg-transparent border border-[#c9a961]/30 text-white py-3 rounded-lg font-medium hover:border-[#c9a961]/50 transition-all"
                  onClick={() => navigate('/cart')}
                >
                  Review Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          Complete your details to place your (demo) order.
        </p>

        {error && (
          <div className="mb-6 border border-red-400/30 bg-red-500/10 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-light text-white mb-4">Shipping Details</h2>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="text-xs tracking-wider uppercase text-zinc-500">Payment Method</label>
                <div className="mt-2 flex gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={form.paymentMethod === 'card'}
                      onChange={onChange}
                    />
                    Card
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={form.paymentMethod === 'paypal'}
                      onChange={onChange}
                    />
                    PayPal
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C9A961] text-black py-4 rounded-lg font-medium hover:bg-[#b89852] transition-all uppercase tracking-wider text-sm disabled:opacity-60"
              >
                <i className="mr-2 fa fa-lock" />
                {submitting ? 'Placing order...' : `Place Order (${total.toLocaleString()})`}
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
            <h2 className="text-xl font-light text-white mb-4">Order Summary</h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 bg-black/20 border border-zinc-800/50 rounded-xl p-4"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <i className="fa fa-box" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-[#c9a961] font-light">{item.name}</p>
                        <p className="text-xs tracking-wider uppercase text-zinc-500 mt-1">
                          {item.collection}
                        </p>
                      </div>
                      <p className="text-sm text-white/90">
                        ${Number(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">Qty: {item.qty}</p>
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
                Demo mode: This checkout does not process payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

