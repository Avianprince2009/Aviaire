export const AUTH_KEYS = {
  token: 'aviaire_auth_token',
  role: 'aviaire_auth_role',
}

export const authStore = {
  getToken() {
    try {
      return localStorage.getItem(AUTH_KEYS.token)
    } catch {
      return null
    }
  },

  getRole() {
    try {
      return localStorage.getItem(AUTH_KEYS.role)
    } catch {
      return null
    }
  },

  isAuthed() {
    return !!this.getToken()
  },

  isAdmin() {
    return this.getRole() === 'admin'
  },

  login({ role = 'user', token = 'demo' } = {}) {
    localStorage.setItem(AUTH_KEYS.token, token)
    localStorage.setItem(AUTH_KEYS.role, role)
  },

  logout() {
    localStorage.removeItem(AUTH_KEYS.token)
    localStorage.removeItem(AUTH_KEYS.role)
  },
}

