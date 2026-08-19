import api from './api'

export const loansService = {
  getAll: (params) => api.get('/loans', { params }),
  getById: (id) => api.get(`/loans/${id}`),
  getMine: () => api.get('/loans/my'),
  getOverdue: () => api.get('/loans/overdue'),
  create: (data) => api.post('/loans', data),
  return: (id) => api.put(`/loans/${id}/return`),
  renew: (id) => api.put(`/loans/${id}/renew`)
}
