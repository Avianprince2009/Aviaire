import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { postJson } from '../services/apiClient'
const logo = "/logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [emailForReset, setEmailForReset] = useState('')
  const [loading, setLoading] = useState(false)

  const forgotFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setLoading(true)
      try {
        const data = await postJson('forgot-password', { email: values.email })
        if (!data) throw new Error('Failed to request reset code')

        // Move to reset step regardless of whether user exists (backend generic response)
        setEmailForReset(values.email)
        setStep(2)
        setStatus({ message: 'Check your email for the OTP code.' })
      } catch (e) {
        console.error(e)
        setStatus({ message: 'Something went wrong. Please try again.' })
      } finally {
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  const resetFormik = useFormik({
    initialValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      otp: Yup.string().required('OTP is required'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus, resetForm }) => {
      setLoading(true)
      try {
        const data = await postJson('reset-password', {
          email: emailForReset,
          otp: values.otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        })
        if (!data) throw new Error('Failed to reset password')

        setStatus({ message: 'Password updated successfully. Please log in.' })
        resetForm()
        setStep(1)
        navigate('/login', { replace: true })
      } catch (e) {
        console.error(e)
        setStatus({ message: 'Something went wrong. Please try again.' })
      } finally {
        setSubmitting(false)
        setLoading(false)
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

          {step === 1 ? (
            <>
              <h1 className="mb-2 text-2xl font-light tracking-widest text-center text-white">
                Forgot Password
              </h1>
              <p className="mb-8 text-sm text-center text-white/60">
                Enter your email to receive an OTP.
              </p>

              <form onSubmit={forgotFormik.handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={forgotFormik.handleChange}
                    onBlur={forgotFormik.handleBlur}
                    value={forgotFormik.values.email}
                    className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
                  />
                  {forgotFormik.touched.email && forgotFormik.errors.email && (
                    <p className="mt-2 text-xs text-red-400">{forgotFormik.errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotFormik.isSubmitting || loading}
                  className="w-full bg-[#C9A961] text-black py-4 text-xs tracking-[0.3em] uppercase hover:bg-[#B89851] transition mt-2 disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>

              {forgotFormik.status?.message && (
                <p className="mt-5 text-sm text-center text-white/60">
                  {forgotFormik.status.message}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-light tracking-widest text-center text-white">
                Reset Password
              </h1>
              <p className="mb-8 text-sm text-center text-white/60">
                Enter the OTP we sent to <span className="text-white">{emailForReset}</span>
              </p>

              <form onSubmit={resetFormik.handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                    OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                    value={resetFormik.values.otp}
                    className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
                  />
                  {resetFormik.touched.otp && resetFormik.errors.otp && (
                    <p className="mt-2 text-xs text-red-400">{resetFormik.errors.otp}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                    value={resetFormik.values.newPassword}
                    className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
                  />
                  {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                    <p className="mt-2 text-xs text-red-400">{resetFormik.errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/60 text-xs tracking-[0.2em] uppercase mb-3">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                    value={resetFormik.values.confirmPassword}
                    className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white text-sm focus:border-[#C9A961] focus:outline-none transition"
                  />
                  {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                    <p className="mt-2 text-xs text-red-400">
                      {resetFormik.errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetFormik.isSubmitting || loading}
                  className="w-full bg-[#C9A961] text-black py-4 text-xs tracking-[0.3em] uppercase hover:bg-[#B89851] transition mt-2 disabled:opacity-60"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              {resetFormik.status?.message && (
                <p className="mt-5 text-sm text-center text-white/60">
                  {resetFormik.status.message}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setEmailForReset('')
                }}
                className="mt-6 w-full bg-transparent text-white/60 border border-white/10 py-3 text-xs tracking-[0.3em] uppercase hover:text-white transition"
              >
                Back
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-center text-white/40">© 2026 L'ALLURE. All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default ForgotPassword

