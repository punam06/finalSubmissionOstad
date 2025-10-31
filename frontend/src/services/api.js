import axios from 'axios'

const api = axios.create({
  baseURL: '/api/',
  headers: { 'Content-Type': 'application/json' },
})

api.setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('bm_access_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('bm_access_token')
  }
}

api.loadToken = () => {
  const token = localStorage.getItem('bm_access_token')
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api
