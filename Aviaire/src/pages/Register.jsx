import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import logo from '../assets/logo.png'

const Register = () => {
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aviaire-backend.onrender.com/api/v1'


        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          // Surface backend error details to help debug why users aren't being created.
          const details = typeof data === 'object' ? JSON.stringify(data) : String(data)
          throw new Error(data?.message ? `${data.message} | ${details}` : `Registration failed | ${details}`)
        }

        navigate('/login', { replace: true })
      } catch (e) {
        console.error(e)
        alert(e.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/10 p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="L'ALLURE" className="w-50 animate-sway" />
          </div>

          <h1 className="mb-2 text-2xl font-light tracking-widest text-center text-white">
            Request Access
          </h1>
          <p className="mb-8 text-sm text-center text-white/60">
            Join the private collection
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                Name
              </label>
              <input
                type="text"
                name="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-2 text-xs text-red-400">{formik.errors.name}</p>
              )}
            </div>

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
              <input
                type="password"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-xs text-red-400">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-400">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-[#C9A961] text-black py-4 text-xs tracking-[0.3em] uppercase hover:bg-[#B89851] transition mt-2 disabled:opacity-60"
            >
              {formik.isSubmitting ? 'Requesting...' : 'Request Access'}
            </button>
          </form>

          <div className="pt-6 mt-8 text-center border-t border-white/10">
            <p className="text-xs text-white/60">
              Already a client?
              <Link to="/login" className="text-[#C9A961] hover:text-white transition ml-2">
                Enter
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-center text-white/40">
          © 2026 L'ALLURE. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Register
