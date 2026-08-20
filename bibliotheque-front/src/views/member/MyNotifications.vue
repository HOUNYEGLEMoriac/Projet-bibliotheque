<template>
  <div class="member-space">
    <div class="container">

      <!-- ── EN-TÊTE ──────────────────────────────────────── -->
      <div class="member-header">
        <div class="welcome-text">
          <h1>Mes Notifications & Relances</h1>
          <p>Consultez les alertes concernant vos retours de livres et vos réservations.</p>
        </div>
        <button
          v-if="notifications.some((n) => !n.is_read)"
          class="btn btn-outline-primary"
          @click="markAllAsRead"
          :disabled="actionLoading"
        >
          Tout marquer comme lu
        </button>
      </div>

      <!-- ── NAVIGATION ONGLETS ────────────────────────────── -->
      <nav class="member-tabs">
        <RouterLink to="/member/dashboard" class="tab-item">
          Vue d'ensemble
        </RouterLink>
        <RouterLink to="/member/loans" class="tab-item">
          Mes emprunts
        </RouterLink>
        <RouterLink to="/member/reservations" class="tab-item">
          Mes réservations
        </RouterLink>
        <RouterLink to="/member/history" class="tab-item">
          Historique
        </RouterLink>
        <RouterLink to="/member/notifications" class="tab-item active">
          Notifications
          <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
        </RouterLink>
        <RouterLink to="/member/profile" class="tab-item">
          Mon profil
        </RouterLink>
      </nav>

      <!-- ── CONTENU PRINCIPAL ─────────────────────────────── -->
      <div class="section-card">

        <!-- Barre d'outils / Filtre -->
        <div class="table-toolbar">
          <div class="filter-tabs">
            <button
              :class="['filter-btn', filter === 'all' ? 'active' : '']"
              @click="filter = 'all'"
            >
              Toutes ({{ notifications.length }})
            </button>
            <button
              :class="['filter-btn', filter === 'unread' ? 'active' : '']"
              @click="filter = 'unread'"
            >
              Non lues ({{ unreadCount }})
            </button>
          </div>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="loading-box">
          <Chargement message="Chargement de vos notifications..." />
        </div>

        <!-- État vide -->
        <div v-else-if="filteredNotifications.length === 0" class="empty-box">
          <p v-if="filter === 'unread'">Vous n'avez aucune notification non lue.</p>
          <p v-else>Vous n'avez reçu aucune notification pour le moment.</p>
        </div>

        <!-- Liste des notifications -->
        <div v-else class="notifications-list">
          <div
            v-for="notif in filteredNotifications"
            :key="notif.id"
            class="notification-item"
            :class="{ 'unread': !notif.is_read }"
          >
            <div class="notification-indicator">
              <span class="type-badge" :class="getTypeClass(notif.type)">
                {{ getTypeLabel(notif.type) }}
              </span>
              <span v-if="!notif.is_read" class="unread-dot"></span>
            </div>

            <div class="notification-body">
              <p class="notification-message">{{ notif.message }}</p>
              <span class="notification-date">{{ formaterDate(notif.sent_at || notif.created_at) }}</span>
            </div>

            <div class="notification-actions">
              <button
                v-if="!notif.is_read"
                class="btn-action"
                title="Marquer comme lu"
                @click="markSingleAsRead(notif.id)"
              >
                Marquer comme lu
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { formaterDate } from '@/utils/dates'
import Chargement from '@/components/common/Chargement.vue'

const notifStore = useNotificationsStore()

const loading = ref(true)
const actionLoading = ref(false)
const filter = ref('all')

const notifications = computed(() => notifStore.notifications)
const unreadCount = computed(() => notifStore.unreadCount)

const filteredNotifications = computed(() => {
  if (filter.value === 'unread') {
    return notifications.value.filter((n) => !n.is_read)
  }
  return notifications.value
})

function getTypeLabel(type) {
  const map = {
    reminder_before: 'Rappel préventif',
    reminder_due: "Échéance aujourd'hui",
    overdue: 'Retard de retour',
    overdue_critical: 'Retard critique',
    reservation_ready: 'Réservation disponible',
    reservation_cancelled: 'Réservation annulée'
  }
  return map[type] || 'Information'
}

function getTypeClass(type) {
  const map = {
    reminder_before: 'badge-info',
    reminder_due: 'badge-warning',
    overdue: 'badge-danger',
    overdue_critical: 'badge-danger',
    reservation_ready: 'badge-success',
    reservation_cancelled: 'badge-neutral'
  }
  return map[type] || 'badge-neutral'
}

async function markSingleAsRead(id) {
  try {
    await notifStore.markRead(id)
  } catch (err) {
    console.error('Erreur lecture notification', err)
  }
}

async function markAllAsRead() {
  actionLoading.value = true
  try {
    await notifStore.markAllRead()
  } catch (err) {
    console.error('Erreur marquage global', err)
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await notifStore.fetchMine()
  loading.value = false
})
</script>

<style scoped>
.member-space {
  min-height: calc(100vh - 140px);
  background: #f5f7fb;
  padding: 2.5rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── HEADER ────────────────────────────────────────────── */
.member-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.welcome-text h1 {
  font-size: 1.8rem;
  color: #1a237e;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.welcome-text p {
  color: #666;
  font-size: 0.95rem;
}

/* ── TABS ──────────────────────────────────────────────── */
.member-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.tab-item {
  padding: 0.8rem 1.3rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  color: #666;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: #1a237e;
}

.tab-item.active {
  color: #1a237e;
  border-bottom-color: #1a237e;
}

.tab-badge {
  background: #e53935;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
  margin-left: 0.4rem;
}

/* ── SECTION CARD ──────────────────────────────────────── */
.section-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 1.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.table-toolbar {
  margin-bottom: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  background: none;
  border: 1px solid #dcdfe6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #555;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #1a237e;
  color: #1a237e;
}

.filter-btn.active {
  background: #1a237e;
  color: white;
  border-color: #1a237e;
}

/* ── LISTE DE NOTIFICATIONS ────────────────────────────── */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #eaeaea;
  transition: all 0.2s;
}

.notification-item.unread {
  background: #f0f4ff;
  border-color: #c5d4f8;
}

.notification-indicator {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 180px;
}

.type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge-info { background: #e3f2fd; color: #1565c0; }
.badge-warning { background: #fff8e1; color: #f57f17; }
.badge-danger { background: #ffebee; color: #c62828; }
.badge-success { background: #e8f5e9; color: #2e7d32; }
.badge-neutral { background: #f5f5f5; color: #616161; }

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1a237e;
}

.notification-body {
  flex: 1;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.notification-message {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.4;
}

.notification-date {
  font-size: 0.8rem;
  color: #888;
}

.notification-actions {
  min-width: 140px;
  text-align: right;
}

.btn-action {
  background: white;
  border: 1px solid #dcdfe6;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #1a237e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #1a237e;
  color: white;
  border-color: #1a237e;
}

/* ── BOUTONS ────────────────────────────────────────────── */
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.btn-outline-primary {
  border: 1.5px solid #1a237e;
  color: #1a237e;
  background: white;
}

.btn-outline-primary:hover:not(:disabled) {
  background: #f0f4ff;
}

:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-box, .empty-box {
  padding: 4rem 1rem;
  text-align: center;
  color: #777;
}
</style>
