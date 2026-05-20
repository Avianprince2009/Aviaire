import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/Logo.png'

const Navbar = ({ cartCount = 0, isLoggedIn = false, userEmail = null, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const getInitials = (email) => {
    if (!email) return 'U'
    const part = String(email).split('@')[0] || email
    const words = part.split(/[._\-\s]+/).filter(Boolean)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  const initials = getInitials(userEmail)

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
        {isLoggedIn ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-[#C9A961]/15 hover:bg-[#C9A961]/25 border border-[#C9A961]/30 flex items-center justify-center"
              aria-label="Open profile"
            >
              <span className="text-[gold] text-xs font-semibold">{initials}</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-black border border-[#c9a961]/20 rounded-xl shadow-2xl shadow-black/50 p-3">
                <div className="px-2 py-2">
                  <p className="text-xs text-white/70">Signed in as</p>
                  <p className="text-sm text-[#c9a961] truncate">{userEmail}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const ok = window.confirm('Do you want to log out?')
                    if (ok) {
                      setProfileOpen(false)
                      onLogout?.()
                    }
                  }}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                >
                  <i className="fa fa-sign-out-alt text-sm" />
                  <span className="text-xs uppercase tracking-widest">Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="bi bi-person-circle text-[gold]"></Link>
        )}

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
