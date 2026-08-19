import api from './api'

export const notificationsService = {
  getMine: () => api.get('/notifications/my'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all')
}
