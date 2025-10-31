import axios from 'axios'

const api = axios.create({
  baseURL: '/api/',
  headers: { 'Content-Type': 'application/json' },
})

// Token management (access + refresh)
api.setTokens = ({ access, refresh }) => {
  if (access) {
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    localStorage.setItem('bm_access_token', access)
  }
  if (refresh) {
    localStorage.setItem('bm_refresh_token', refresh)
  }
}

api.clearTokens = () => {
  delete api.defaults.headers.common['Authorization']
  localStorage.removeItem('bm_access_token')
  localStorage.removeItem('bm_refresh_token')
}

api.loadToken = () => {
  const token = localStorage.getItem('bm_access_token')
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Axios response interceptor to refresh token when access expires
api.interceptors.response.use(
  resp => resp,
  async err => {
    const originalRequest = err.config
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refresh = localStorage.getItem('bm_refresh_token')
      if (!refresh) {
        api.clearTokens()
        return Promise.reject(err)
      }
      try {
        const r = await axios.post('/api/auth/token/refresh/', { refresh })
        const newAccess = r.data.access
        api.setTokens({ access: newAccess })
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (e) {
        api.clearTokens()
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  }
)

export default api
