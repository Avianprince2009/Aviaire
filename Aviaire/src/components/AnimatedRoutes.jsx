import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const AnimatedRoutes = ({ children }) => {
  const location = useLocation()

  const key = useMemo(() => `${location.pathname}${location.search || ''}`, [location.pathname, location.search])

  return (
    <div key={key} className="page-transition" aria-live="polite">
      {children}
    </div>
  )
}


export default AnimatedRoutes

