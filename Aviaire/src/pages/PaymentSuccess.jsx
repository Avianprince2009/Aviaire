import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { postJson } from '../services/apiClient'

function useQuery(search) {
  return useMemo(() => new URLSearchParams(search), [search])
}

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const query = useQuery(location.search)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  const loadShippingInfo = () => {
    try {
      const raw = localStorage.getItem('aviaire_shipping_info')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  useEffect(() => {
    const verifyPayment = async () => {
      setError(null)
      setLoading(true)
      try {
        const reference = query.get('reference') || query.get('trxref') || ''
        if (!reference) throw new Error('Missing payment reference from URL')

        const shippingInfo = loadShippingInfo() || {}
        const response = await postJson('paystack/verify', { reference, shippingInfo })
        const data = response?.data || response

        if (!data) {
          throw new Error('Invalid verification response')
        }

        setOrder(data)
        setLoading(false)

        try {
          localStorage.removeItem('cart')
          localStorage.removeItem('cartItems')
          localStorage.removeItem('aviaire_shipping_info')
        } catch {
          // ignore
        }

        window.dispatchEvent(new Event('aviaireCartCleared'))
      } catch (err) {
        setError(err?.message || 'Payment verification failed')
        setLoading(false)
      }
    }

    verifyPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#C9A961]/5 border border-[#C9A961]/20 flex items-center justify-center mb-6">
            <i className="fa fa-spinner fa-spin text-[#C9A961] text-3xl" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-serif font-light text-[#C9A961]">Verifying payment...</h1>
          <p className="mt-3 text-sm text-zinc-400">Please wait while we confirm your order.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-400/30 flex items-center justify-center mb-6">
            <i className="fa fa-times text-red-300 text-3xl" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-serif font-light text-red-200">Payment verification failed</h1>
          <p className="mt-3 text-sm text-zinc-400">{error}</p>
          <button
            className="mt-8 px-8 py-3 bg-[#C9A961] text-black rounded-lg hover:bg-[#b89852] transition-all"
            onClick={() => navigate('/checkout')}
          >
            Return to Checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C9A961] text-center tracking-wide mb-4">
          Order Confirmed
        </h1>
        <p className="max-w-2xl mx-auto mb-10 text-sm text-center text-zinc-400 md:text-base">
          Your payment was verified and your order has been created successfully.
        </p>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 md:p-8 rounded-xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs tracking-wider uppercase text-zinc-500">Order ID</p>
              <p className="text-3xl font-light text-white">
                <span className="text-[#c9a961]">{order?.orderId || order?.data?.orderId || 'N/A'}</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#C9A961]/15 border border-[#C9A961]/25 flex items-center justify-center">
              <i className="fa fa-check text-[#C9A961] text-2xl" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#c9a961]/10">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Payment Reference</p>
                <p className="mt-2 text-sm text-white/90">{order?.paymentReference || order?.data?.paymentReference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Total Paid</p>
                <p className="mt-2 text-sm text-white/90">${Number(order?.total || order?.data?.total || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8 sm:flex-row">
              <button
                className="flex-1 bg-[#C9A961] text-black py-3 rounded-lg font-medium hover:bg-[#b89852] transition-all"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
              <button
                className="flex-1 bg-transparent border border-[#c9a961]/30 text-white py-3 rounded-lg font-medium hover:border-[#c9a961]/50 transition-all"
                onClick={() => navigate('/collections')}
              >
                Browse Collections
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
