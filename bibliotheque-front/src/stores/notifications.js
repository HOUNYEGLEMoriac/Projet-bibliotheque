import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationsService } from '@/services/notificationsService'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.is_read).length
  )

  async function fetchMine() {
    loading.value = true
    try {
      const res = await notificationsService.getMine()
      notifications.value = res.data
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function markRead(id) {
    await notificationsService.markRead(id)
    const n = notifications.value.find((n) => n.id === id)
    if (n) n.is_read = true
  }

  async function markAllRead() {
    await notificationsService.markAllRead()
    notifications.value.forEach((n) => (n.is_read = true))
  }

  return {
    notifications, loading, unreadCount,
    fetchMine, markRead, markAllRead
  }
})
