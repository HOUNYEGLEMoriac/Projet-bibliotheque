import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ─── INTERCEPTEUR REQUEST ─────────────────────────────
// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── INTERCEPTEUR RESPONSE ────────────────────────────
// Gère les erreurs globalement
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Une erreur est survenue'

    if (status === 401) {
      // Token expiré ou invalide → déconnexion
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/connexion'
    }

    if (status === 403) {
      window.location.href = '/403'
    }

    if (status === 500) {
      window.location.href = '/500'
    }

    return Promise.reject({ message, status })
  }
)

export default api
