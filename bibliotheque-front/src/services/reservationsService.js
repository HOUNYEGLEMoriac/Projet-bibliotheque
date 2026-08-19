import api from './api'

export const reservationsService = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  getMine: () => api.get('/reservations/my'),
  create: (data) => api.post('/reservations', data),
  cancel: (id) => api.delete(`/reservations/${id}`),
  markReady: (id) => api.put(`/reservations/${id}/ready`)
}
