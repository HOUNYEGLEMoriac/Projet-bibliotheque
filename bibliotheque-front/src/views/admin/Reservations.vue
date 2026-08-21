<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── EN-TÊTE ──────────────────────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Gestion des Réservations</h1>
            <p>Suivi des listes d'attente et mise à disposition des ouvrages retournés.</p>
          </div>
        </div>

        <Alerte
          v-if="actionAlert.message"
          :message="actionAlert.message"
          :type="actionAlert.type"
          :duree="4000"
          @fermer="actionAlert.message = ''"
        />

        <div class="panel-card">

          <!-- Barre d'outils -->
          <div class="table-toolbar">
            <select v-model="statusFilter" @change="fetchReservations" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente de retour</option>
              <option value="ready">Prêts à retirer au guichet</option>
              <option value="fulfilled">Honorées / Clôturées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>

          <!-- Chargement -->
          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement des réservations..." />
          </div>

          <!-- État vide -->
          <div v-else-if="reservations.length === 0" class="empty-box">
            <p>Aucune réservation trouvée.</p>
          </div>

          <!-- Tableau -->
          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Livre demandé</th>
                  <th>Adhérent demandeur</th>
                  <th>Date demande</th>
                  <th>File / Rang</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="res in reservations" :key="res.id">

                  <td>
                    <div class="font-bold text-dark">{{ res.book?.title }}</div>
                    <div class="text-muted text-sm">{{ res.book?.author }}</div>
                  </td>

                  <td>
                    <div class="font-medium text-dark">
                      {{ res.member?.first_name }} {{ res.member?.last_name }}
                    </div>
                    <div class="text-muted text-sm">
                      {{ res.member?.user?.email || res.member?.email }}
                    </div>
                  </td>

                  <td>{{ formaterDate(res.reserved_at) }}</td>

                  <td>
                    <span v-if="res.status === 'pending'" class="queue-pill">
                      Position {{ res.position }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>

                  <td>
                    <span class="status-pill" :class="getStatusClass(res.status)">
                      {{ getStatusLabel(res.status) }}
                    </span>
                  </td>

                  <td>
                    <div class="actions-cell">
                      <button
                        v-if="res.status === 'pending'"
                        class="btn-sm btn-ready"
                        @click="markReady(res.id)"
                      >
                        Passer prêt à retirer
                      </button>

                      <button
                        v-if="res.status === 'pending' || res.status === 'ready'"
                        class="btn-sm btn-cancel"
                        @click="cancelReservation(res.id)"
                      >
                        Annuler
                      </button>
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'
import { reservationsService } from '@/services/reservationsService'
import { formaterDate } from '@/utils/dates'

const loading = ref(true)
const reservations = ref([])
const statusFilter = ref('')

const actionAlert = reactive({
  message: '',
  type: 'info'
})

function getStatusLabel(status) {
  const map = {
    pending: 'En attente',
    ready: 'Prêt à retirer',
    fulfilled: 'Honorée',
    cancelled: 'Annulée'
  }
  return map[status] || status
}

function getStatusClass(status) {
  const map = {
    pending: 'status-pending',
    ready: 'status-ready',
    fulfilled: 'status-fulfilled',
    cancelled: 'status-cancelled'
  }
  return map[status] || ''
}

async function fetchReservations() {
  loading.value = true
  try {
    const params = {
      status: statusFilter.value || undefined
    }
    const res = await reservationsService.getAll(params)
    reservations.value = res.data || []
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de charger les réservations.'
  } finally {
    loading.value = false
  }
}

async function markReady(id) {
  try {
    await reservationsService.markReady(id)
    actionAlert.type = 'succes'
    actionAlert.message = "La réservation est passée au statut 'Prêt à retirer'. L'adhérent a été notifié."
    fetchReservations()
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Action impossible.'
  }
}

async function cancelReservation(id) {
  if (!confirm('Annuler cette réservation ?')) return
  try {
    await reservationsService.cancel(id)
    actionAlert.type = 'succes'
    actionAlert.message = 'Réservation annulée.'
    fetchReservations()
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors de l’annulation.'
  }
}

onMounted(() => {
  fetchReservations()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  padding: 2.5rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.page-header p {
  color: #64748b;
  font-size: 0.95rem;
}

.panel-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.8rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.table-toolbar {
  margin-bottom: 1.5rem;
}

.filter-select {
  height: 42px;
  padding: 0 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  color: #334155;
  outline: none;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.8rem 1rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  vertical-align: middle;
}

.font-bold { font-weight: 700; }
.font-medium { font-weight: 600; }
.text-dark { color: #0f172a; }
.text-muted { color: #64748b; }
.text-sm { font-size: 0.8rem; }

.queue-pill {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8rem;
}

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-pending { background: #fef3c7; color: #b45309; }
.status-ready { background: #dcfce7; color: #15803d; }
.status-fulfilled { background: #f1f5f9; color: #64748b; }
.status-cancelled { background: #fee2e2; color: #b91c1c; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.btn-ready {
  background: #16a34a;
  color: white;
}
.btn-ready:hover { background: #15803d; }

.btn-cancel {
  background: #fee2e2;
  color: #b91c1c;
}
.btn-cancel:hover { background: #fecaca; }

.loading-box, .empty-box {
  padding: 4rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
