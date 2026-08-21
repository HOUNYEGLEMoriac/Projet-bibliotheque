<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Historique des Relances Envoyées</h1>
            <p>Journal complet des notifications automatiques et manuelles expédiées.</p>
          </div>
          <RouterLink to="/admin/notifications" class="btn btn-secondary">
            ← Configuration des règles
          </RouterLink>
        </div>

        <div class="panel-card">

          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement de l'historique..." />
          </div>

          <div v-else-if="history.length === 0" class="empty-box">
            <p>Aucune notification enregistrée dans l'historique.</p>
          </div>

          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Destinataire</th>
                  <th>Type de relance</th>
                  <th>Message expédié</th>
                  <th>Date d'envoi</th>
                  <th>Statut lecture</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in history" :key="item.id">
                  <td>
                    <div class="font-bold text-dark">
                      {{ item.member?.first_name }} {{ item.member?.last_name }}
                    </div>
                    <div class="text-muted text-sm">{{ item.member?.user?.email || item.member?.email }}</div>
                  </td>
                  <td>
                    <span class="type-pill" :class="getTypeClass(item.type)">
                      {{ item.type }}
                    </span>
                  </td>
                  <td class="msg-cell">{{ item.message }}</td>
                  <td>{{ formaterDate(item.sent_at || item.created_at) }}</td>
                  <td>
                    <span class="read-status" :class="item.is_read ? 'read' : 'unread'">
                      {{ item.is_read ? 'Consultée' : 'Non lue' }}
                    </span>
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
import { ref, onMounted } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import api from '@/services/api'
import { formaterDate } from '@/utils/dates'

const loading = ref(true)
const history = ref([])

function getTypeClass(type) {
  if (type?.includes('overdue')) return 'pill-danger'
  if (type?.includes('reminder')) return 'pill-info'
  if (type?.includes('ready')) return 'pill-success'
  return 'pill-neutral'
}

async function fetchHistory() {
  loading.value = true
  try {
    const res = await api.get('/admin/notifications/history')
    history.value = res.data || []
  } catch (err) {
    console.error('Erreur chargement historique', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistory()
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.text-dark { color: #0f172a; }
.text-muted { color: #64748b; }
.text-sm { font-size: 0.82rem; }

.msg-cell {
  max-width: 400px;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.4;
}

.type-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}

.pill-info { background: #dbeafe; color: #1e40af; }
.pill-danger { background: #fee2e2; color: #b91c1c; }
.pill-success { background: #dcfce7; color: #15803d; }
.pill-neutral { background: #f1f5f9; color: #475569; }

.read-status {
  font-size: 0.8rem;
  font-weight: 600;
}
.read-status.read { color: #16a34a; }
.read-status.unread { color: #94a3b8; }

.btn {
  height: 40px;
  padding: 0 1.2rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn-secondary:hover { background: #f8fafc; }

.loading-box, .empty-box {
  padding: 4rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
