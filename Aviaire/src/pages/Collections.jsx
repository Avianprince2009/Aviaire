import React, { useState } from 'react'
import WatchCard from '../components/WatchCard'

const COLLECTIONS = [
  { key: 'all', label: 'All' },
  { key: 'rolex', label: 'Rolex' },
  { key: 'patek-philippe', label: 'Patek Philippe' },
  { key: 'audemars-piguet', label: 'Audemars Piguet' },
  { key: 'omega', label: 'Omega' },
  { key: 'cartier', label: 'Cartier' },
]

const Collections = ({ products, addToCart }) => {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? products
    : products.filter(p => p.collection === activeFilter)

  return (
    <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-7xl">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C9A961] text-center tracking-wide mb-4">
          Our Collections
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-center text-zinc-400 md:text-base">
          Discover our curated selection of exquisite timepieces, each representing the pinnacle of horological artistry.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {COLLECTIONS.map(col => (
            <button
              key={col.key}
              onClick={() => setActiveFilter(col.key)}
              className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-300 border ${
                activeFilter === col.key
                  ? 'bg-[#C9A961] text-black border-[#C9A961]'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-[#C9A961] hover:text-[#C9A961]'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#C9A961]/5 flex items-center justify-center mb-6">
              <i className="fa fa-gem text-[#C9A961]/30 text-3xl"></i>
            </div>
            <p className="font-serif text-lg text-zinc-300">No timepieces found</p>
            <p className="mt-2 text-sm text-zinc-600">Check back later for new arrivals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(product => (
              <WatchCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collections
