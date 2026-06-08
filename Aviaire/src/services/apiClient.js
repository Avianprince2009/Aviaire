import axios from 'axios'
import { apiUrl } from '../config/api'
import { authStore } from '../auth/authStore'

const DEFAULT_TIMEOUT = 6000

// Auth endpoints (login/register) can take longer due to bcrypt + MongoDB.
// Increasing timeout prevents intermittent AbortController-triggered failures.
const AUTH_TIMEOUT = 20000

function isAuthEndpoint(path) {
  const p = String(path || '').toLowerCase()
  return p === 'login' || p === 'register' || p.endsWith('/login') || p.endsWith('/register')
}

function createApiError(message, meta = {}) {
  const err = new Error(message || 'Request failed')
  if (meta.status != null) err.status = meta.status
  if (meta.response != null) err.response = meta.response
  if (meta.isAbort) err.isAbort = true
  if (meta.isTimeout) err.isTimeout = true
  if (meta.originalError != null) err.originalError = meta.originalError
  return err
}

export function getErrorMessage(error, fallback = 'An unexpected error occurred') {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (error instanceof Error && error.message) return error.message
  if (error.response?.data?.message) return String(error.response.data.message)
  if (error.response?.message) return String(error.response.message)
  if (typeof error.message === 'string') return error.message
  if (error.status != null) return `Request failed with status ${error.status}`
  return fallback
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.code === 'ERR_CANCELED' ||
    String(error?.message).toLowerCase().includes('abort')
  )
}

const axiosInstance = axios.create({ timeout: DEFAULT_TIMEOUT })

axiosInstance.interceptors.request.use(
  (config) => {
    console.debug('[api] axios request', config.method, config.url)
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getErrorMessage(error, 'Request failed. Please try again.')
    return Promise.reject(
      createApiError(message, {
        status: error?.response?.status,
        response: error?.response?.data,
        isAbort: isAbortError(error),
        originalError: error,
      })
    )
  }
)

async function safeParseTextOrJson(response) {
  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json') || /^\s*[\{\[]/.test(text)) {
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }
  return text
}

export async function request(path, opts = {}) {
  const {
    method = 'GET',
    headers = {},
    json,
    body,
    timeout = DEFAULT_TIMEOUT,
    signal: externalSignal,
  } = opts

  // Extend timeout for login/register to prevent intermittent AbortController failures.
  const finalTimeout = isAuthEndpoint(path)
    ? Math.max(timeout, AUTH_TIMEOUT)
    : timeout

  const url = /^https?:\/\//i.test(path) ? path : apiUrl(path)

  console.log('[api] Constructing request:', {
    method,
    pathArg: path,
    finalUrl: url,
    timeout: finalTimeout,
  })

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  try {
    const token = authStore.getToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
      console.log('[api] Token found, adding Authorization header')
    } else {
      console.warn('[api] No token found for request to', path)
    }
  } catch {
    // ignore storage errors
  }

  if (json !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const fetchOpts = {
    method,
    headers: requestHeaders,
  }

  if (json !== undefined) {
    fetchOpts.body = JSON.stringify(json)
  } else if (body !== undefined) {
    fetchOpts.body = body
  }

  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now()
  console.debug('[api] request', method, url)

  let timeoutId = null
  let controller = null

  if (!externalSignal && typeof AbortController !== 'undefined') {
    controller = new AbortController()
  }

  if (controller) {
    fetchOpts.signal = controller.signal
    timeoutId = setTimeout(() => controller.abort(), finalTimeout)
  } else if (externalSignal) {
    fetchOpts.signal = externalSignal
  }

  try {
    const res = await fetch(url, fetchOpts)
    if (timeoutId) clearTimeout(timeoutId)

    const parsed = await safeParseTextOrJson(res)

    if (!res.ok) {
      console.error('[api] Request failed:', { method, url, status: res.status, response: parsed })
      const message = parsed?.message || parsed || `HTTP ${res.status}`
      throw createApiError(message, { status: res.status, response: parsed })
    }

    const dt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0
    console.debug('[api] success', method, url, `${Math.round(dt)}ms`)
    return parsed
  } catch (fetchErr) {
    if (timeoutId) clearTimeout(timeoutId)

    if (isAbortError(fetchErr)) {
      throw createApiError('Request was aborted', {
        isAbort: true,
        isTimeout: true,
        originalError: fetchErr,
      })
    }

    console.warn('[api] fetch failed, attempting axios fallback', fetchErr?.name, getErrorMessage(fetchErr))

    try {
      const res = await axiosInstance({
        url,
        method: method.toLowerCase(),
        data: json ?? body,
        headers: requestHeaders,
        timeout: finalTimeout,
        signal: controller?.signal || externalSignal,
      })
      return res.data
    } catch (axErr) {
      throw createApiError(getErrorMessage(axErr), {
        status: axErr?.response?.status,
        response: axErr?.response?.data,
        isAbort: isAbortError(axErr),
        originalError: axErr,
      })
    }
  }
}

export const postJson = (path, data, extra = {}) => request(path, { method: 'POST', json: data, ...extra })
export const getJson = (path, extra = {}) => request(path, { method: 'GET', ...extra })

export default { request, postJson, getJson, getErrorMessage }

