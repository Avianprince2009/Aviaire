import { apiUrl } from '../config/api'
import { authStore } from '../auth/authStore'

async function safeParseTextOrJson(response) {
  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json') || /^\s*[\{\[]/.test(text)) {
    try {
      return JSON.parse(text)
    } catch (e) {
      // malformed JSON
      return null
    }
  }
  return text
}

export async function request(path, opts = {}) {
  const { method = 'GET', headers = {}, json, body, timeout = 15000, signal: externalSignal } = opts
  const url = /^https?:\/\//i.test(path) ? path : apiUrl(path)

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  try {
    const token = authStore.getToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore localStorage errors
  }

  const fetchOpts = {
    method,
    headers: requestHeaders,
  }

  if (json !== undefined) {
    fetchOpts.headers['Content-Type'] = 'application/json'
    fetchOpts.body = JSON.stringify(json)
  } else if (body !== undefined) {
    fetchOpts.body = body
  }

  console.debug('[api] request', method, url)

  let timeoutId = null
  try {
    const controller = !externalSignal && typeof AbortController !== 'undefined' ? new AbortController() : null
    if (controller) {
      fetchOpts.signal = controller.signal
      timeoutId = setTimeout(() => {
        controller.abort()
      }, timeout)
    } else if (externalSignal) {
      fetchOpts.signal = externalSignal
    }

    const res = await fetch(url, fetchOpts)
    if (timeoutId) clearTimeout(timeoutId)
    const parsed = await safeParseTextOrJson(res)

    if (!res.ok) {
      const message = parsed?.message || parsed || `HTTP ${res.status}`
      const err = new Error(message)
      err.status = res.status
      err.response = parsed
      throw err
    }

    return parsed
  } catch (fetchErr) {
    if (timeoutId) clearTimeout(timeoutId)
    if (fetchErr && fetchErr.name === 'AbortError') {
      fetchErr.isTimeout = true
      fetchErr.isAbort = true
      fetchErr.message = fetchErr.message || 'Request was aborted'
    }
    console.warn('[api] fetch failed, attempting axios fallback', fetchErr?.name, fetchErr?.message)
    try {
      const axios = (await import('axios')).default
      const res = await axios({ url, method: method.toLowerCase(), data: json ?? body, headers: requestHeaders, timeout })
      return res.data
    } catch (axErr) {
      console.error('[api] axios fallback failed', axErr)
      if (axErr.response) {
        const err = new Error(axErr.response.data?.message || `HTTP ${axErr.response.status}`)
        err.status = axErr.response.status
        err.response = axErr.response.data
        throw err
      }
      throw fetchErr
    }
  }
}

export const postJson = (path, data, extra = {}) =>
  request(path, { method: 'POST', json: data, ...extra })

export const getJson = (path, extra = {}) => request(path, { method: 'GET', ...extra })

export default { request, postJson, getJson }
