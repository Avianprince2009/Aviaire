import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const AdminDashboard = ({ products, setProducts }) => {
  const [showToast, setShowToast] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [editingId, setEditingId] = useState(null)

  const formik = useFormik({
    initialValues: {
      name: '',
      collection: 'patek-philippe',
      price: '',
      imageUrl: '',
      imageFile: null,
      description: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Watch name is required'),
      collection: Yup.string().required('Select a collection'),
      price: Yup.number()
        .typeError('Price must be a number')
        .positive('Price must be positive')
        .required('Price is required'),
      imageUrl: Yup.string().test(
        'image-required',
        'Image URL or file required',
        function (value) {
          const { imageFile } = this.parent
          if (imageFile) return true
          return /^https?:\/\/.+/.test(value || '')
        }
      ),
      description: Yup.string().max(300, 'Max 300 characters'),
    }),
    onSubmit: (values, { resetForm }) => {
      const finalImage = values.imageFile ? imagePreview : values.imageUrl

      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? {
          ...p,
          name: values.name,
          collection: values.collection,
          price: parseFloat(values.price),
          imageUrl: finalImage,
          description: values.description,
        } : p))
        setShowToast(true)
        setEditingId(null)
        resetForm()
        setImagePreview('')
        setTimeout(() => setShowToast(false), 3000)
      } else {
        const newProduct = {
          id: Date.now(),
          name: values.name,
          collection: values.collection,
          price: parseFloat(values.price),
          imageUrl: finalImage,
          description: values.description,
        }

        setProducts(prev => [newProduct, ...prev])
        setShowToast(true)
        
        resetForm()
        setImagePreview('')
        setTimeout(() => setShowToast(false), 3000)
      }
    },
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      formik.setFieldValue('imageFile', file)
      formik.setFieldValue('imageUrl', '')
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (e) => {
    const value = e.target.value
    formik.setFieldValue('imageUrl', value)
    formik.setFieldValue('imageFile', null)
    setImagePreview(value)
  }

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    formik.setValues({
      name: product.name,
      collection: product.collection,
      price: product.price,
      imageUrl: product.imageUrl || '',
      imageFile: null,
      description: product.description || '',
    })
    setImagePreview(product.imageUrl || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    formik.resetForm()
    setImagePreview('')
  }

  const currentImage = imagePreview || formik.values.imageUrl

  return (
    <div className='bg-[#0a0a0a] text-white min-h-screen font-sans mt-16'>
      {showToast && (
        <div className='fixed top-6 right-6 z-50 bg-[#c9a961] text-black px-6 py-3 rounded shadow-lg animate-in fade-in slide-in-from-top-2'>
          <i className="mr-2 fa fa-check-circle"></i>{editingId ? 'Watch updated' : 'Watch added to collection'}
        </div>
      )}

      <div className='p-8 mx-auto max-w-8xl'>
        <div className='mb-16 border-b border-[#c9a961]/10 pb-8'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-full bg-linear-to-br from-[#c9a961] to-[#8b7544] flex items-center justify-center'>
              <i className="text-xl text-black fa fa-crown"></i>
            </div>
            <div>
              <h1 className='text-4xl font-serif font-light text-[#c9a961] tracking-wide'>Dashboard</h1>
              <p className='mt-1 text-sm tracking-widest uppercase text-zinc-500'>L'ALLURE</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-10 lg:grid-cols-5'>
          <div className='lg:col-span-2'>
            <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-8 rounded-xl shadow-2xl shadow-black/50 h-fit sticky top-8'>
              <div className='flex items-center gap-3 mb-8'>
                <div className='w-10 h-10 rounded-lg bg-[#c9a961]/10 flex items-center justify-center'>
                  <i className={`text-[#c9a961] fa ${editingId ? 'fa-pen' : 'fa-plus'}`}></i>
                </div>
                <h2 className='font-serif text-2xl font-light'>{editingId ? 'Edit Entry' : 'Create Entry'}</h2>
              </div>

              <form onSubmit={formik.handleSubmit} className='space-y-6'>
                {currentImage && (
                  <div className='p-4 border rounded-lg bg-zinc-800/50 border-zinc-700/50'>
                    <p className='mb-3 text-xs tracking-wider uppercase text-zinc-500'>Preview</p>
                    <img
                      src={currentImage}
                      alt="Preview"
                      className='object-contain w-full h-48 bg-white rounded'
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                <div>
                  <label className='block mb-3 text-xs tracking-widest uppercase text-zinc-400'>
                    <i className="fa fa-clock text-[#c9a961] mr-2"></i>Timepiece Name
                  </label>
                  <input
                    name='name'
                    placeholder='Patek Philippe Nautilus'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] focus:bg-zinc-800 outline-none transition-all duration-300'
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className='flex items-center mt-2 text-xs text-red-400'>
                      <i className="mr-1.5 fa fa-exclamation-circle"></i>{formik.errors.name}
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-3 text-xs tracking-widest uppercase text-zinc-400'>
                      <i className="fa fa-layer-group text-[#c9a961] mr-2"></i>Collection
                    </label>
                    <select
                      name='collection'
                      onChange={formik.handleChange}
                      value={formik.values.collection}
                      className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all'
                    >
                      <option value='rolex'>Rolex</option>
                      <option value='patek-philippe'>Patek Philippe</option>
                      <option value='audemars-piguet'>Audemars Piguet</option>
                      <option value="omega">Omega</option>
                      <option value="cartier">Cartier</option>
                    </select>
                  </div>

                  <div>
                    <label className='block mb-3 text-xs tracking-widest uppercase text-zinc-400'>
                      <i className="fa fa-dollar-sign text-[#c9a961] mr-2"></i>Retail Price
                    </label>
                    <input
                      name='price'
                      type='number'
                      placeholder='12400'
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.price}
                      className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all'
                    />
                    {formik.touched.price && formik.errors.price && (
                      <div className='flex items-center mt-2 text-xs text-red-400'>
                        <i className="mr-1.5 fa fa-exclamation-circle"></i>{formik.errors.price}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className='block mb-3 text-xs tracking-widest uppercase text-zinc-400'>
                    <i className="fa fa-image text-[#c9a961] mr-2"></i>Image Asset
                  </label>
                  <div className='space-y-3'>
                    <input
                      name='imageUrl'
                      placeholder='https://example.com/watch.jpg'
                      onChange={handleUrlChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.imageUrl}
                      className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all'
                    />
                    <div className='flex items-center gap-3'>
                      <div className='flex-1 h-px bg-zinc-700/50'></div>
                      <span className='text-xs text-zinc-500'>OR</span>
                      <div className='flex-1 h-px bg-zinc-700/50'></div>
                    </div>
                    <label className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm hover:border-[#c9a961] cursor-pointer transition-all flex items-center justify-center gap-2'>
                      <i className="fa fa-upload text-[#c9a961]"></i>
                      <span className='text-zinc-400'>Choose File</span>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                        className='hidden'
                      />
                    </label>
                    {formik.values.imageFile && (
                      <p className='text-xs text-[#c9a961]'>
                        <i className="mr-1 fa fa-check"></i>{formik.values.imageFile.name}
                      </p>
                    )}
                  </div>
                  {formik.touched.imageUrl && formik.errors.imageUrl && (
                    <div className='flex items-center mt-2 text-xs text-red-400'>
                      <i className="mr-1.5 fa fa-exclamation-circle"></i>{formik.errors.imageUrl}
                    </div>
                  )}
                </div>

                <div>
                  <label className='block mb-3 text-xs tracking-widest uppercase text-zinc-400'>
                    <i className="fa fa-align-left text-[#c9a961] mr-2"></i>Description
                  </label>
                  <textarea
                    name='description'
                    placeholder='Brief description...'
                    rows='3'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                    className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-sm focus:border-[#c9a961] outline-none transition-all resize-none'
                  />
                </div>

                {editingId && (
                  <button
                    type='button'
                    onClick={handleCancelEdit}
                    className='w-full border border-zinc-600 text-zinc-300 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-all duration-300 uppercase tracking-wider text-sm mb-3'
                  >
                    <i className="mr-2 fa fa-times"></i>Cancel Edit
                  </button>
                )}
                <button
                  type='submit'
                  className='w-full bg-linear-to-r from-[#c9a961] to-[#b89852] text-black py-3.5 rounded-lg font-medium hover:shadow-lg hover:shadow-[#c9a961]/20 hover:scale-[1.02] mt-8 transition-all duration-300 uppercase tracking-wider text-sm'
                >
                  <i className={`mr-2 fa ${editingId ? 'fa-save' : 'fa-plus'}`}></i>{editingId ? 'Update Timepiece' : 'Register Timepiece'}
                </button>
              </form>
            </div>
          </div>

          <div className='lg:col-span-3'>
            <div className='bg-zinc-900/40 backdrop-blur-xl border border-[#c9a961]/15 p-8 rounded-xl shadow-2xl shadow-black/50'>
              <div className='flex items-center gap-3 mb-8 pb-6 border-b border-[#c9a961]/10'>
                <div className='w-10 h-10 rounded-lg bg-[#c9a961]/10 flex items-center justify-center'>
                  <i className="fa fa-gem text-[#c9a961]"></i>
                </div>
                <h2 className='font-serif text-2xl font-light'>Collection</h2>
                <div className='flex items-center gap-2 ml-auto'>
                  <span className='bg-[#c9a961]/10 text-[#c9a961] text-xs px-4 py-2 rounded-full font-medium tracking-wider'>
                    {products.length} {products.length === 1 ? 'PIECE' : 'PIECES'}
                  </span>
                </div>
              </div>

              {products.length === 0 ? (
                <div className='py-32 text-center'>
                  <div className='w-20 h-20 mx-auto rounded-full bg-[#c9a961]/5 flex items-center justify-center mb-6'>
                    <i className="fa fa-gem text-[#c9a961]/30 text-3xl"></i>
                  </div>
                  <p className='font-serif text-lg text-zinc-300'>No Entries</p>
                  <p className='mt-2 text-sm text-zinc-600'>Begin by registering your first timepiece</p>
                </div>
              ) : (
                <div className='pr-2 space-y-4 overflow-y-auto max-h-175 custom-scroll'>
                  {products.map(product => (
                    <div key={product.id} className='group flex gap-5 bg-zinc-800/30 p-5 rounded-xl border border-zinc-700/30 hover:border-[#c9a961]/40 hover:bg-zinc-800/50 transition-all duration-300'>
                      <img src={product.imageUrl} alt={product.name} className='object-contain w-24 h-24 bg-white rounded-lg shadow-lg' />
                      <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <h3 className='font-serif text-lg text-[#c9a961] font-light'>{product.name}</h3>
                            <div className='flex items-center gap-3 mt-2'>
                              <span className='text-xs tracking-wider uppercase text-zinc-500'>
                                <i className="mr-1.5 fa fa-layer-group text-[#c9a961]/60"></i>{product.collection}
                              </span>
                              <span className='text-xs text-zinc-600'>•</span>
                              <span className='text-xs text-zinc-500'>
                                ID: {product.id.toString().slice(-6)}
                              </span>
                            </div>
                          </div>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() => handleEdit(product)}
                            className='text-sm transition-all opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-[#c9a961]'
                            title='Edit'
                          >
                            <i className="fa fa-pen"></i>
                          </button>
                          <button
                            type='button'
                            onClick={() => handleDelete(product.id)}
                            className='text-sm transition-all opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400'
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                        </div>
                        {product.description && (
                          <p className='mt-3 text-xs text-zinc-500 line-clamp-2'>{product.description}</p>
                        )}
                        <p className='mt-3 text-base font-light'>
                          <i className="fa fa-tag text-[#c9a961] mr-2 text-xs"></i>${Number(product.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c9a961;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard