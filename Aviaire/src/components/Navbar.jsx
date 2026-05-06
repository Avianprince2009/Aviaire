import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const Navbar = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className='fixed top-0 left-0 right-0 flex bg-black backdrop-blur-md text-yellow-300 px-5 items-center justify-between drop-shadow-2xl z-50'>
      <div>
        <Link to="/">
          <img src={logo} alt="logo" className='w-20 h-20 drop-shadow-2xl' />
        </Link>
      </div>
      <div className='hidden md:flex gap-10'>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/collections">Collections</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className='flex items-center gap-4'>
        <Link to="/login" className="bi bi-person-circle text-[gold]"></Link>
        <Link to="/cart" className="relative fas fa-shopping-bag text-[gold] text-xl">
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[gold] text-2xl">
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black flex flex-col items-center py-4 gap-4 text-yellow-300">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/collections" onClick={() => setIsOpen(false)}>Collections</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  )
}

export default Navbar
