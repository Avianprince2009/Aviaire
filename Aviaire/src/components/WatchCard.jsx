import React from 'react'

const WatchCard = ({ product, onDelete, onEdit, onAddToCart }) => {
  return (
    <div className='group bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 rounded-xl shadow-2xl shadow-black/50 hover:border-[#c9a961]/40 hover:shadow-[#c9a961]/10 transition-all duration-300 overflow-hidden'>
      <div className='relative h-56 bg-white overflow-hidden'>
        <img
          src={product.imageUrl}
          alt={product.name}
          className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105'
        />
        <div className='absolute top-4 right-4'>
          <span className='bg-[#0a0a0a]/90 text-[#c9a961] text-xs px-3 py-1.5 rounded-full font-medium tracking-wider uppercase backdrop-blur-sm border border-[#c9a961]/20'>
            {product.collection}
          </span>
        </div>
      </div>

      <div className='p-6'>
        <div className='mb-4'>
          <h3 className='font-serif text-xl text-[#c9a961] font-light mb-2 leading-tight line-clamp-1'>
            {product.name}
          </h3>
          <p className='text-xs tracking-wider uppercase text-zinc-500'>
            <i className="fa fa-fingerprint text-[#c9a961]/60 mr-1.5"></i>
ID: {String(product?.id ?? '').slice(-6)}
          </p>
        </div>

        {product.description && (
          <p className='mb-5 text-sm leading-relaxed text-zinc-400 line-clamp-2'>
            {product.description}
          </p>
        )}

        <div className='flex items-center justify-between pt-4 border-t border-[#c9a961]/10'>
          <div>
            <p className='mb-1 text-xs tracking-wider uppercase text-zinc-500'>Retail Price</p>
            <p className='text-2xl font-light text-white'>
              <span className='text-[#c9a961]'>$</span>{Number(product.price).toLocaleString()}
            </p>
          </div>

          <div className='flex gap-2'>
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className='w-9 h-9 rounded-lg bg-[#c9a961]/10 text-[#c9a961] hover:bg-[#c9a961]/20 hover:scale-110 transition-all flex items-center justify-center'
                title="Edit"
              >
                <i className="text-xs fa fa-pen"></i>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className='flex items-center justify-center text-red-400 transition-all rounded-lg w-9 h-9 bg-red-500/10 hover:bg-red-500/20 hover:scale-110'
                title="Delete"
              >
                <i className="text-xs fa fa-trash"></i>
              </button>
            )}
            {onAddToCart && (
              <button
                onClick={() => onAddToCart(product)}
                className='flex items-center justify-center text-black transition-all rounded-lg px-4 h-9 bg-[#c9a961] hover:bg-[#b89852] hover:scale-105'
                title="Add to Cart"
              >
                <i className="mr-1.5 text-xs fa fa-shopping-bag"></i>
                <span className="text-xs font-medium">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchCard
