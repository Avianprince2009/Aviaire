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

  if (requireAdmin && !authStore.isAdmin()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

export default AuthGuard

