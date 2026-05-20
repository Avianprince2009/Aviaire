import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/Logo.png'

const Footer = () => {
  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-16">
          
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <img className="w-50 mb-6" src={logo} alt="L'ALLURE" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Where centuries of craftsmanship converge upon a single moment in time.
            </p>
          </div>

          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-6">Navigation</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white/60 hover:text-[#C9A961] text-sm transition">Home</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-[#C9A961] text-sm transition">About</Link></li>
              <li><Link to="/collections" className="text-white/60 hover:text-[#C9A961] text-sm transition">Collections</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-[#C9A961] text-sm transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-6">Client Services</h3>
            <ul className="space-y-4">
              <li><Link to="/login" className="text-white/60 hover:text-[#C9A961] text-sm transition">Account Login</Link></li>
              <li><Link to="/orders" className="text-white/60 hover:text-[#C9A961] text-sm transition">Order Status</Link></li>
              <li><Link to="/shipping" className="text-white/60 hover:text-[#C9A961] text-sm transition">Shipping & Returns</Link></li>
              <li><Link to="/warranty" className="text-white/60 hover:text-[#C9A961] text-sm transition">Warranty</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-6">Legal</h3>
            <ul className="space-y-4 mb-8">
              <li><Link to="/privacy" className="text-white/60 hover:text-[#C9A961] text-sm transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/60 hover:text-[#C9A961] text-sm transition">Terms of Service</Link></li>
            </ul>

            <div className="flex items-center gap-6">
              <a href="https://instagram.com/lallure" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/40 hover:text-[#C9A961] transition text-lg">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://youtube.com/@lallure" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/40 hover:text-[#C9A961] transition text-lg">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="https://tiktok.com/@lallure" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/40 hover:text-[#C9A961] transition text-lg">
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

        </div>

        <div className="w-full h-px bg-white/10 mb-6"></div>
        <div className="flex justify-center md:justify-between items-center">
          <p className="text-white/40 text-xs">
            © 2026 L’ALLURE. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer