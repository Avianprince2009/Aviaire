// Use Vite-provided environment variable for API base URL.
// This file normalizes the value and exports a single API URL helper.
const raw = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_API_BASE_URL
  : undefined

function normalizeBase(rawValue) {
  const fallback = 'https://aviaire-backend.onrender.com/api/v1'
  if (!rawValue) return fallback

  let cleaned = String(rawValue).replace(/^VITE_API_BASE_URL=/, '').trim()
  if (!cleaned) return fallback

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned.replace(/^\/+/, '')}`
  }

  cleaned = cleaned.replace(/\/$/, '')
  if (!/\/api\/(v\d+)/.test(cleaned)) {
    cleaned = `${cleaned}/api/v1`
  }

  return cleaned
}

export const API = normalizeBase(raw)
export const API_BASE_URL = API

export const apiUrl = (path = '') => {
  const base = String(API).replace(/\/$/, '')
  const p = String(path || '').replace(/^\//, '')
  return `${base}/${p}`
}
