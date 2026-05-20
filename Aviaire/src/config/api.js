// Normalize and validate the Vite-provided environment variable.
const raw = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_API_BASE_URL
  : undefined

function normalizeBase(rawValue) {
  if (!rawValue) return 'https://aviaire-backend.onrender.com/api/v1'

  // If someone mistakenly provided a query-string-like value such as
  // "VITE_API_BASE_URL=https://...", strip the prefix.
  const cleaned = String(rawValue).replace(/^VITE_API_BASE_URL=/, '')

  // Ensure protocol is present
  if (!/^https?:\/\//i.test(cleaned)) {
    return `https://${cleaned.replace(/^\/+/, '')}`
  }

  // Remove trailing slash
  return cleaned.replace(/\/$/, '')
}

export const API_BASE_URL = normalizeBase(raw)

export const apiUrl = (path = '') => {
  const base = String(API_BASE_URL).replace(/\/$/, '')
  const p = String(path || '').replace(/^\//, '')
  return `${base}/${p}`
}