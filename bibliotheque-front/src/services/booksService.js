import api from './api'

export const booksService = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (q) => api.get('/books/search', { params: { q } }),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  remove: (id) => api.delete(`/books/${id}`),
  getCopies: (id) => api.get(`/books/${id}/copies`),
  // Ajouts pour Home.vue
  getCategories: () => api.get('/categories'),
  getStats: () => api.get('/dashboard/stats')
}
