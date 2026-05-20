import { apiUrl } from '../config/api'

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
  const { method = 'GET', headers = {}, json, body, timeout = 15000 } = opts

  const url = /^https?:\/\//i.test(path) ? path : apiUrl(path)

  const fetchOpts = {
    method,
    headers: { ...headers },
  }

  if (json !== undefined) {
    fetchOpts.headers['Content-Type'] = 'application/json'
    fetchOpts.body = JSON.stringify(json)
  } else if (body !== undefined) {
    fetchOpts.body = body
  }

  console.debug('[api] request', method, url)

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    if (controller) {
      fetchOpts.signal = controller.signal
      setTimeout(() => controller.abort(), timeout)
    }

    const res = await fetch(url, fetchOpts)
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
    console.warn('[api] fetch failed, attempting axios fallback', fetchErr)
    try {
      const axios = (await import('axios')).default
      const res = await axios({ url, method: method.toLowerCase(), data: json ?? body, headers })
      return res.data
    } catch (axErr) {
      console.error('[api] axios fallback failed', axErr)
      throw fetchErr
    }
  }
}

export const postJson = (path, data, extra = {}) =>
  request(path, { method: 'POST', json: data, ...extra })

export const getJson = (path, extra = {}) => request(path, { method: 'GET', ...extra })

export default { request, postJson, getJson }
