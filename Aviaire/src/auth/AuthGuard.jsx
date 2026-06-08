import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authStore } from './authStore'

const AuthGuard = ({ children, requireAuth = false, requireAdmin = false }) => {
  const location = useLocation()
  const [, setTick] = useState(0)

  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener('authChange', handler)
    return () => window.removeEventListener('authChange', handler)
  }, [])

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
    // Client-side gate; server-side middleware is also enforced.
    if (!authStore.isAdmin()) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }
    return <>{children}</>
  }


  return children
}

export default AuthGuard

