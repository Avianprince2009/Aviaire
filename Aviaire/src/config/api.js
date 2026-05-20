export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aviaire-backend.onrender.com/api/v1'

export const apiUrl = (path = '') => {
  const base = String(API_BASE_URL).replace(/\/$/, '')
  const p = String(path).replace(/^\//, '')
  return p ? `${base}/${p}` : base
}

