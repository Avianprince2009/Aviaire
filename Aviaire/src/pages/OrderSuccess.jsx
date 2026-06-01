import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { postJson } from '../services/apiClient'
import { authStore } from '../auth/authStore'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

const OrderSuccess = () => {
  const navigate = useNavigate()
  const { orderId: orderIdParam } = useParams()
  const query = useQuery()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  const referenceFromQuery = query.get('reference') || query.get('trxref') || query.get('referenceId')

  const getEmailFromTokenOrQuery = () => {
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
    return query.get('email')
  }

  useEffect(() => {
    const verifyAndFinalize = async () => {
      setError(null)
      setLoading(true)

      try {
        const reference = String(referenceFromQuery || '').trim()
        if (!reference) {
          throw new Error('Missing Paystack reference. Please try again.')
        }

        console.log('[OrderSuccess] verifying payment reference:', reference)

        // Shipping details must be provided to backend verify.
        // We attempt to read them from query params first, otherwise fail.
        const shipping = {
          fullName: query.get('fullName') || query.get('name'),
          email: query.get('email') || getEmailFromTokenOrQuery(),
          phone: query.get('phone') || '',
          address1: query.get('address1') || query.get('address'),
          city: query.get('city') || '',
          country: query.get('country') || '',
          postalCode: query.get('postalCode') || query.get('zip') || '',
        }

        const verifyResp = await postJson('paystack/verify', {
          reference,
          ...shipping,
        })

        console.log('[OrderSuccess] Paystack verify response:', verifyResp)
        const data = verifyResp?.data || verifyResp || {}
        setOrder(data)

        // Clear cart only after successful order save.
        try {
          localStorage.removeItem('cart')
          localStorage.removeItem('cartItems')
          sessionStorage.removeItem('cart')
          sessionStorage.removeItem('cartItems')
          localStorage.removeItem('aviaire_shipping_info')
        } catch {
          // ignore
        }

        window.dispatchEvent(new Event('aviaireCartCleared'))
        navigate('/cart', { replace: true })
      } catch (err) {
        setError(err?.message || 'Payment could not be verified.')
      } finally {
        setLoading(false)
      }
    }

    verifyAndFinalize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceFromQuery])

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
          <h1 className="text-2xl font-serif font-light text-red-200">Payment not completed</h1>
          <p className="mt-3 text-sm text-zinc-400">{error}</p>
          <button
            className="mt-8 px-8 py-3 bg-[#C9A961] text-black rounded-lg hover:bg-[#b89852] transition-all"
            onClick={() => navigate('/cart')}
          >
            Return to Cart
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
          Thank you! Your payment was successful.
        </p>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 md:p-8 rounded-xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs tracking-wider uppercase text-zinc-500">Order ID</p>
              <p className="text-3xl font-light text-white">
                <span className="text-[#c9a961]">{order?.orderId || order?.id}</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#C9A961]/15 border border-[#C9A961]/25 flex items-center justify-center">
              <i className="fa fa-check text-[#C9A961] text-2xl" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#c9a961]/10">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-zinc-400">
                Placed: {order?.placedAt ? new Date(order.placedAt).toLocaleString() : '—'}
              </p>
              <p className="text-sm text-zinc-400">
                Total paid: ${Number(order?.total || 0).toLocaleString()}
              </p>
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

export default OrderSuccess

