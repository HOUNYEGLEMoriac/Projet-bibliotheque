import api from './api'

export const authService = {
  connexion: (donnees) => api.post('/auth/login', donnees),
  inscription: (donnees) => api.post('/auth/register', donnees),
  motDePasseOublie: (email) => api.post('/auth/forgot-password', { email }),
  reinitialiserMotDePasse: (token, motDePasse) =>
    api.post('/auth/reset-password', { token, motDePasse })
}
