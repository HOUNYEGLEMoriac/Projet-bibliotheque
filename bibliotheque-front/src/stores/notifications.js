import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])

  const nbNonLues = computed(
    () => notifications.value.filter((n) => !n.lue).length
  )

  function ajouterNotification(notif) {
    notifications.value.unshift({
      id: Date.now(),
      lue: false,
      date: new Date(),
      ...notif
    })
  }

  function marquerCommeLue(id) {
    const notif = notifications.value.find((n) => n.id === id)
    if (notif) notif.lue = true
  }

  function toutMarquerCommeLu() {
    notifications.value.forEach((n) => (n.lue = true))
  }

  return {
    notifications,
    nbNonLues,
    ajouterNotification,
    marquerCommeLue,
    toutMarquerCommeLu
  }
})
