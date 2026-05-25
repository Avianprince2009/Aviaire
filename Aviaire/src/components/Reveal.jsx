import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Reveal component for viewport entrance animations.
 * - Uses IntersectionObserver.
 * - Respects prefers-reduced-motion (no transform transition).
 */
const Reveal = ({
  as: Tag = 'div',
  children,
  className = '',
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  delayMs = 0,
}) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(true)
      return
    }

    const node = ref.current
    if (!node || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    obs.observe(node)
    return () => obs.disconnect()
  }, [prefersReducedMotion, threshold, rootMargin])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

export default Reveal

