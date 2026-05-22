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
  const [searchQuery, setSearchQuery] = useState('')

  const collectionFiltered =
    activeFilter === 'all'
      ? products
      : products.filter((p) => p.collection === activeFilter)

  const q = searchQuery.trim().toLowerCase()

  const filtered = q
    ? collectionFiltered.filter((p) => {
        const nameMatch = String(p?.name ?? '').toLowerCase().includes(q)
        const collectionMatch = String(p?.collection ?? '').toLowerCase().includes(q)
        return nameMatch || collectionMatch
      })
    : collectionFiltered

  return (
    <div className="min-h-screen bg-[#111111] text-white pt-24 pb-16 px-6 md:px-12">
      {/* Header */}
      <div className="mx-auto mb-6 sm:mb-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#C9A961] text-center tracking-wide mb-3">
          Our Collections
        </h1>

        <p className="max-w-2xl mx-auto text-sm text-center text-zinc-400 md:text-base">
          Discover our curated selection of exquisite timepieces, each representing the pinnacle of horological artistry.
        </p>
      </div>

      {/* Filter + Search */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex flex-col items-center gap-6">
          {/* Search */}
          <div className="w-full">
            <label className="sr-only" htmlFor="collections-search">
              Search collections
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/30 px-4 py-3">
              <i className="fa fa-search text-[#C9A961]/70" aria-hidden="true"></i>
              <input
                id="collections-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search watches (name or brand)"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-zinc-500"
              />
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-white transition"
                  aria-label="Clear search"
                >
                  <i className="fa fa-times" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </div>

          {/* Collection chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {COLLECTIONS.map((col) => (
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
            {filtered.map((product) => (
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
