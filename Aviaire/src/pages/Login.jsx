import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import logo from '../assets/logo.png'
import { authStore } from '../auth/authStore'

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4008/api/v1'
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Login failed')

        // backend returns: { token }
        authStore.login({ role: 'user', token: data.token })
        // navigate to protected area if needed
        navigate('/', { replace: true })

      } catch (e) {
        console.error(e)
        alert(e.message)
      }
    },
  })

  return (
    <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center px-6 py-3">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/10 p-8 mt-20 md:p-12">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="L'ALLURE" className="w-50 animate-sway" />
          </div>

          <h1 className="mb-2 text-2xl font-light tracking-widest text-center text-white">
            Welcome Back
          </h1>
          <p className="mb-8 text-sm text-center text-white/60">
            Access your private collection
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                E-mail
              </label>
              <input 
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-2 text-xs text-red-400">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 pr-12 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-xs text-red-400">{formik.errors.password}</p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-[#C9A961] text-black py-4 text-xs tracking-[0.3em] uppercase hover:bg-[#B89851] transition mt-2"
            >
              Enter
            </button>
          </form>

          <div className="pt-6 mt-8 text-center border-t border-white/10">
            <p className="text-xs text-white/60">
              New client? 
              <Link to="/register" className="text-[#C9A961] hover:text-white transition ml-2">
                Request Access
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-center text-white/40">
          © 2026 L’ALLURE. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Login