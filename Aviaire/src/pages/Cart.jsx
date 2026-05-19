import React from 'react'
import { Link } from 'react-router-dom'

const Cart = ({ cart, removeFromCart, updateCartQty }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C9A961] text-center tracking-wide mb-4">
          Your Cart
        </h1>
        <p className="max-w-2xl mx-auto mb-12 text-sm text-center text-zinc-400 md:text-base">
          Review your selected timepieces before proceeding to checkout.
        </p>

        {cart.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#C9A961]/5 flex items-center justify-center mb-6">
              <i className="fa fa-shopping-bag text-[#C9A961]/30 text-3xl"></i>
            </div>
            <p className="font-serif text-lg text-zinc-300">Your cart is empty</p>
            <p className="mt-2 text-sm text-zinc-600">Discover our collections and add your favorite timepieces</p>
            <Link to="/collections" className="inline-block mt-6 px-8 py-3 bg-[#C9A961] text-black rounded-lg hover:bg-[#b89852] transition-all">
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-5 bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-5 rounded-xl hover:border-[#c9a961]/40 transition-all duration-300">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="object-cover w-full h-48 sm:w-24 sm:h-24 bg-white rounded-lg shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-[#c9a961] font-light">{item.name}</h3>
                      <p className="mt-1 text-xs tracking-wider uppercase text-zinc-500">
                        <i className="mr-1.5 fa fa-layer-group text-[#c9a961]/60"></i>{item.collection}
                      </p>
                    </div>
                      <button
                        onClick={() => removeFromCart(item.productId ?? item.id)}
                        className="text-sm transition-all text-zinc-600 hover:text-red-400"
                      >
                        <i className="fa fa-times"></i>
                      </button>

                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartQty(item.productId ?? item.id, item.qty - 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:border-[#c9a961] hover:text-[#c9a961] transition-all flex items-center justify-center"
                      >
                        <i className="text-xs fa fa-minus"></i>
                      </button>
                      <span className="w-6 text-sm font-medium text-center">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.productId ?? item.id, item.qty + 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:border-[#c9a961] hover:text-[#c9a961] transition-all flex items-center justify-center"
                      >
                        <i className="text-xs fa fa-plus"></i>
                      </button>
                    </div>
                    <p className="text-xl font-light">
                      <span className="text-[#c9a961]">$</span>{(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-[#c9a961]/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Total Items: {cart.reduce((sum, item) => sum + item.qty, 0)}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-xs tracking-wider uppercase text-zinc-500">Grand Total</p>
                  <p className="text-3xl font-light text-white">
                    <span className="text-[#c9a961]">$</span>{total.toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="w-full mt-6 bg-[#c9a961] text-black py-4 rounded-lg font-medium hover:bg-[#b89852] transition-all uppercase tracking-wider text-sm">
                <i className="mr-2 fa fa-lock"></i>Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

