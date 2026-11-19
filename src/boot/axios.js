import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' })

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('api-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
      localStorage.removeItem('api-token')
      window.dispatchEvent(new Event('sessao-expirada'))
    }
    return Promise.reject(error)
  },
)

export { api }
