import api from './api'

export const membersService = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  update: (id, data) => api.put(`/members/${id}`, data),
  remove: (id) => api.delete(`/members/${id}`),
  activate: (id) => api.put(`/members/${id}/activate`),
  deactivate: (id) => api.put(`/members/${id}/deactivate`),
  getLoans: (id) => api.get(`/members/${id}/loans`),
  getReservations: (id) => api.get(`/members/${id}/reservations`)
}
