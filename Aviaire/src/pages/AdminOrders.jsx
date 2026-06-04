import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getJson, postJson, request, getErrorMessage } from '../services/apiClient'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function formatMoney(amountKobo, currency = 'NGN') {
  const amount = Number(amountKobo || 0)
  if (!Number.isFinite(amount)) return '0'
  const naira = amount / 100
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(naira)
  } catch {
    return `₦${naira.toLocaleString()}`
  }
}

function getOrderCustomerFields(order) {
  const s = order?.shipping || {}
  return {
    fullName: s.fullName || '—',
    email: s.email || '—',
    phone: s.phone || '',
    address1: s.address1 || '',
    city: s.city || '',
    country: s.country || '',
    postalCode: s.postalCode || '',
  }
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' })
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3200)
  }

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const fetchRequestIdRef = useRef(0)

  const stats = useMemo(() => {
    const totalOrders = totalCount || 0
    const pending = orders.filter((o) => o.orderStatusSystem === 'pending').length
    const completed = orders.filter((o) => o.orderStatusSystem === 'delivered').length
    const totalRevenueKobo = orders.reduce((sum, o) => sum + Number(o?.amount || 0), 0)

    // Note: For accuracy across pages, we would need a backend stats endpoint.
    // Keeping client-side stats based on current page fetch.
    const totalCustomers = new Set(
      orders
        .map((o) => o?.shipping?.email)
        .filter(Boolean)
    ).size

    return {
      totalOrders,
      pending,
      completed,
      totalRevenueKobo,
      totalCustomers,
    }
  }, [orders, totalCount])

  const fetchOrders = async () => {
    const requestId = ++fetchRequestIdRef.current
    setLoading(true)

    try {
      const qs = new URLSearchParams()
      if (search.trim()) qs.set('q', search.trim())
      if (status) qs.set('status', status)
      qs.set('page', String(page))
      qs.set('limit', String(limit))

      const data = await getJson(`orders?${qs.toString()}`)
      // Ignore stale slow responses
      if (requestId !== fetchRequestIdRef.current) return

      const payload = data?.data || {}
      setOrders(payload.orders || [])
      setTotalPages(payload.totalPages || 1)
      setTotalCount(payload.totalCount || 0)
    } catch (err) {
      // Ignore stale slow responses
      if (requestId !== fetchRequestIdRef.current) return

      console.error(err)
      showToast(getErrorMessage(err, 'Failed to load orders.'), 'error')
    } finally {
      if (requestId === fetchRequestIdRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status])

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPage(1)
      // fetch will be triggered by the [page, limit, status] effect
    }, 400)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false)

  const openOrder = async (order) => {
    const id = order?._id || order?.id
    if (!id) return

    setSelectedOrderLoading(true)
    try {
      // Load full order details lazily to keep the list payload small.
      const full = await getJson(`orders/${id}`)
      const data = full?.data || {}
      setSelectedOrder(data)
    } catch (err) {
      console.error(err)
      showToast(getErrorMessage(err, 'Failed to load order details.'), 'error')
    } finally {
      setSelectedOrderLoading(false)
    }
  }


  const closeModal = () => {
    setSelectedOrder(null)
    setStatusUpdateLoading(false)
    setSelectedOrderLoading(false)
  }


  const handleStatusUpdate = async (orderId, newStatusSystem) => {
    setStatusUpdateLoading(true)
    try {
      await request(`orders/${orderId}/status`, {
        method: 'PATCH',
        json: { status: newStatusSystem },
      })
      showToast('Order status updated.', 'success')
      await fetchOrders()
      // refresh modal order data too
      if (selectedOrder?.id || selectedOrder?._id) {
        const id = selectedOrder.id || selectedOrder._id
        const fresh = orders.find((o) => String(o._id) === String(id))
        if (fresh) setSelectedOrder(fresh)
      }
    } catch (err) {
      console.error(err)
      showToast(getErrorMessage(err, 'Failed to update status.'), 'error')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const orderRows = orders

  const pagination = (
    <div className='flex items-center justify-between mt-6'>
      <button
        type='button'
        className='px-4 py-2 border rounded-lg border-zinc-700 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed'
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page <= 1}
      >
        Prev
      </button>

      <div className='text-xs tracking-widest uppercase text-zinc-500'>
        Page {page} of {totalPages} ({totalCount} total)
      </div>

      <button
        type='button'
        className='px-4 py-2 border rounded-lg border-zinc-700 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed'
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  )

  return (
    <div className='bg-[#0a0a0a] text-white min-h-screen font-sans mt-16'>
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-[#c9a961] text-black' : 'bg-red-500 text-white'
          }`}
        >
          <i className={`mr-2 fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          {toast.message}
        </div>
      )}

      <div className='px-4 py-6 mx-auto sm:px-6 lg:px-8 max-w-8xl'>
        <div className='mb-8 pb-6 border-b border-[#c9a961]/10'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-linear-to-br from-[#c9a961] to-[#8b7544] flex items-center justify-center'>
              <i className='text-xl text-black fa fa-receipt' />
            </div>
            <div>
              <h1 className='text-4xl font-serif font-light text-[#c9a961] tracking-wide'>Orders</h1>
              <p className='mt-1 text-sm tracking-widest uppercase text-zinc-500'>L'ALLURE</p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className='grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-5'>
          <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-5 rounded-xl'>
            <div className='text-xs tracking-widest uppercase text-zinc-500'>Total Orders</div>
            <div className='mt-2 text-3xl font-light'>{totalCount}</div>
          </div>
          <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-5 rounded-xl'>
            <div className='text-xs tracking-widest uppercase text-zinc-500'>Pending Orders</div>
            <div className='mt-2 text-3xl font-light'>{stats.pending}</div>
          </div>
          <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-5 rounded-xl'>
            <div className='text-xs tracking-widest uppercase text-zinc-500'>Completed Orders</div>
            <div className='mt-2 text-3xl font-light'>{stats.completed}</div>
          </div>
          <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-5 rounded-xl sm:col-span-2 lg:col-span-1'>
            <div className='text-xs tracking-widest uppercase text-zinc-500'>Total Revenue</div>
            <div className='max-w-full mt-2 text-3xl font-light break-words sm:text-4xl'>
              ${formatMoney(stats.totalRevenueKobo).replace('₦', '').trim()}
            </div>
          </div>
          <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-5 rounded-xl'>
            <div className='text-xs tracking-widest uppercase text-zinc-500'>Total Customers</div>
            <div className='mt-2 text-3xl font-light'>{stats.totalCustomers}</div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-6 rounded-xl shadow-2xl shadow-black/50'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-end'>
            <div className='flex-1'>
              <label className='block mb-2 text-xs tracking-widest uppercase text-zinc-400'>
                <i className='fa fa-search text-[#c9a961] mr-2' /> Search (name/email)
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Type customer name or email...'
                className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all'
              />
            </div>

            <div className='w-full lg:w-60'>
              <label className='block mb-2 text-xs tracking-widest uppercase text-zinc-400'>
                <i className='fa fa-filter text-[#c9a961] mr-2' /> Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all'
              >
                <option value=''>All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className='w-full lg:w-40'>
              <label className='block mb-2 text-xs tracking-widest uppercase text-zinc-400'>
                <i className='fa fa-list text-[#c9a961] mr-2' /> Per page
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all'
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders table */}
          <div className='mt-8 overflow-x-auto'>
            <table className='w-full text-sm min-w-[900px]'>
              <thead className='text-xs tracking-widest uppercase text-zinc-500'>
                <tr>
                  <th className='py-3 text-left'>Order ID</th>
                  <th className='py-3 text-left'>Customer</th>
                  <th className='py-3 text-left'>Products</th>
                  <th className='py-3 text-left'>Total</th>
                  <th className='py-3 text-left'>Payment</th>
                  <th className='py-3 text-left'>Order Status</th>
                  <th className='py-3 text-left'>Date</th>
                  <th className='py-3 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-800/40'>
                {loading ? (
                  <tr>
                    <td className='py-10 text-center text-zinc-500' colSpan={8}>
                      Loading...
                    </td>
                  </tr>
                ) : orderRows.length ? (
                  orderRows.map((o) => {
                    // List payload is summary-only (no orderDetails.items).
                    // Show a lightweight products hint; full products are loaded in the modal.
                    const items = o?.orderDetails?.items || []
                    const productsSummary = items.length
                      ? items
                          .map((it) => `${it.name} (x${it.quantity})`)
                          .slice(0, 2)
                          .join(', ')
                      : 'View to see products'
                    const extra = items.length > 2 ? ` +${items.length - 2} more` : ''

                    const amountStr = formatMoney(o?.amount, o?.currency)

                    return (
                      <tr key={o._id} className='hover:bg-zinc-800/20'>
                        <td className='py-4'>
                          <button
                            type='button'
                            className='text-[#c9a961] hover:underline'
                            onClick={() => openOrder(o)}
                          >
                            {o.orderId}
                          </button>
                        </td>
                        <td className='py-4'>
                          <div className='font-light'>{o?.shipping?.fullName || '—'}</div>
                          <div className='text-xs break-words text-zinc-500'>{o?.shipping?.email || ''}</div>
                        </td>
                        <td className='py-4'>
                          <div className='text-xs break-words text-zinc-300'>{productsSummary}{extra}</div>
                        </td>
                        <td className='py-4'>
                          <div className='font-light break-words'>{amountStr}</div>
                        </td>
                        <td className='py-4'>
                          <span className='px-3 py-1 text-xs break-words border rounded-full bg-zinc-800/40 border-zinc-700/50'>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className='py-4'>
                          <span className='px-3 py-1 text-xs break-words border rounded-full bg-zinc-800/40 border-zinc-700/50'>
                            {STATUS_LABEL[o.orderStatusSystem] || o.orderStatus}
                          </span>
                        </td>
                        <td className='py-4'>
                          {o.orderDetails?.placedAt
                            ? new Date(o.orderDetails.placedAt).toLocaleString()
                            : new Date(o.createdAt).toLocaleString()}
                        </td>

                        <td className='py-4'>
                          <button
                            type='button'
                            onClick={() => openOrder(o)}
                            className='px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-[#c9a961] whitespace-nowrap'
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className='py-16 text-center text-zinc-500' colSpan={8}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination}
        </div>
      </div>

      {/* Order modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/70' onClick={closeModal} />

          <div className='relative w-[92%] max-w-3xl rounded-2xl border border-[#C9A961]/25 bg-[#0b0b0b]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-6 max-h-[80vh] overflow-y-auto'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='text-xs tracking-widest uppercase text-zinc-500'>Order</div>
                <h2 className='text-2xl font-serif font-light mt-1 text-[#c9a961]'>{selectedOrder.orderId}</h2>
                <div className='mt-2 text-sm text-zinc-300'>
                  Placed: {selectedOrder?.orderDetails?.placedAt ? new Date(selectedOrder.orderDetails.placedAt).toLocaleString() : new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                type='button'
                onClick={closeModal}
                className='px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-[#c9a961]'
              >
                <i className='fa fa-times' />
              </button>
            </div>

            <div className='grid grid-cols-1 gap-5 mt-6 md:grid-cols-2'>
              <div className='p-5 border bg-zinc-900/40 border-zinc-800/60 rounded-xl'>
                <div className='text-xs tracking-widest uppercase text-zinc-500'>Customer</div>
                <div className='mt-3 text-lg font-light'>{selectedOrder?.shipping?.fullName || '—'}</div>
                <div className='mt-1 text-sm text-zinc-300'>{selectedOrder?.shipping?.email || '—'}</div>
                {selectedOrder?.shipping?.phone && (
                  <div className='mt-1 text-sm text-zinc-300'>Phone: {selectedOrder.shipping.phone}</div>
                )}

                <div className='mt-4 text-xs tracking-widest uppercase text-zinc-500'>Shipping address</div>
                <div className='mt-2 text-sm text-zinc-300'>
                  {selectedOrder?.shipping?.address1 || ''}
                  {selectedOrder?.shipping?.city ? `, ${selectedOrder.shipping.city}` : ''}
                  {selectedOrder?.shipping?.country ? `, ${selectedOrder.shipping.country}` : ''}
                  {selectedOrder?.shipping?.postalCode ? ` (${selectedOrder.shipping.postalCode})` : ''}
                </div>
              </div>

              <div className='p-5 border bg-zinc-900/40 border-zinc-800/60 rounded-xl'>
                <div className='text-xs tracking-widest uppercase text-zinc-500'>Totals & statuses</div>
                <div className='flex items-center justify-between mt-3'>
                  <div className='text-sm text-zinc-300'>Total Amount</div>
                  <div className='text-lg font-light'>{formatMoney(selectedOrder?.amount, selectedOrder?.currency)}</div>
                </div>

                <div className='flex items-center justify-between mt-3'>
                  <div className='text-sm text-zinc-300'>Payment Status</div>
                  <div className='px-3 py-1 text-xs border rounded-full bg-zinc-800/40 border-zinc-700/50'>
                    {selectedOrder?.paymentStatus}
                  </div>
                </div>

                <div className='mt-4'>
                  <label className='block text-xs tracking-widest uppercase text-zinc-400'>
                    Order Status System
                  </label>
                  <div className='mt-2 text-sm text-zinc-300'>
                    {selectedOrder?.orderStatusSystem || 'pending'}
                  </div>
                </div>

                <div className='mt-4'>
                  <label className='block text-xs tracking-widest uppercase text-zinc-400'>
                    Update Order Status
                  </label>
                  <select
                    disabled={statusUpdateLoading}
                    value={selectedOrder?.orderStatusSystem || 'pending'}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all mt-2'
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='mt-3 text-xs text-zinc-500'>
                  Saved to MongoDB and reflected immediately.
                </div>

                <div className='mt-4'>
                  <button
                    type='button'
                    onClick={async () => {
                      if (!selectedOrder?._id && !selectedOrder?.id) return
                      const id = selectedOrder?._id || selectedOrder?.id
                      const ok = window.confirm('Delete this order? This cannot be undone.')
                      if (!ok) return

                      try {
                        await request(`orders/${id}`, { method: 'DELETE' })
                        showToast('Order deleted.', 'success')
                        closeModal()
                        await fetchOrders()
                      } catch (err) {
                        console.error(err)
                        showToast(getErrorMessage(err, 'Failed to delete order.'), 'error')
                      }
                    }}
                    className='w-full py-3 font-medium text-red-300 transition-all duration-300 border rounded-lg bg-red-500/10 border-red-500/40 hover:bg-red-500/15'
                    disabled={statusUpdateLoading}
                  >
                    <i className='mr-2 fa fa-trash' /> Delete Order
                  </button>
                </div>
              </div>
            </div>

            <div className='p-5 mt-6 border bg-zinc-900/40 border-zinc-800/60 rounded-xl'>
              <div className='text-xs tracking-widest uppercase text-zinc-500'>Products Ordered</div>
              <div className='mt-4 overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='text-xs tracking-widest uppercase text-zinc-500'>
                    <tr>
                      <th className='py-2 text-left'>Product</th>
                      <th className='py-2 text-left'>Qty</th>
                      <th className='py-2 text-left'>Unit Price</th>
                      <th className='py-2 text-left'>Line Total</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-zinc-800/40'>
                    {selectedOrderLoading ? (
                      <tr>
                        <td className='py-10 text-center text-zinc-500' colSpan={4}>
                          Loading order...
                        </td>
                      </tr>
                    ) : (
                      (selectedOrder?.orderDetails?.items || []).map((it, idx) => (
                        <tr key={`${it.productId}-${idx}`}>
                          <td className='py-3'>
                            <div className='font-light'>{it.name}</div>
                            {it.collection && <div className='text-xs text-zinc-500'>{it.collection}</div>}
                          </td>
                          <td className='py-3'>{it.quantity}</td>
                          <td className='py-3'>{formatMoney(Math.round(Number(it.price) * 100), selectedOrder?.currency)}</td>
                          <td className='py-3'>{formatMoney(Math.round(Number(it.lineTotal) * 100), selectedOrder?.currency)}</td>
                        </tr>
                      ))
                    )}

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders