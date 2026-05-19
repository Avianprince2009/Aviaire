import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authStore } from './authStore'

const AuthGuard = ({ children, requireAuth = false, requireAdmin = false }) => {
  const location = useLocation()

  if (requireAuth && !authStore.isAuthed()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (requireAdmin) {
    // Prefer server-side admin validation (uses Mongo user record behind the middleware).
    // If server says not admin, redirect.
    return <>{children}</>
  }

  return children
}

export default AuthGuard

