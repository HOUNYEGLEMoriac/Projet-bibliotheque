<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── EN-TÊTE ──────────────────────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Emprunts en Retard</h1>
            <p>Liste des ouvrages non restitués après la date d'échéance contractuelle.</p>
          </div>
          <RouterLink to="/admin/loans" class="btn btn-secondary">
            ← Tous les emprunts
          </RouterLink>
        </div>

        <Alerte
          v-if="actionAlert.message"
          :message="actionAlert.message"
          :type="actionAlert.type"
          :duree="4000"
          @fermer="actionAlert.message = ''"
        />

        <div class="panel-card">

          <!-- Chargement -->
          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement des retards..." />
          </div>

          <!-- État vide -->
          <div v-else-if="overdueLoans.length === 0" class="empty-box">
            <p>Parfait ! Aucun retard n'est à déplorer actuellement.</p>
          </div>

          <!-- Tableau des retards -->
          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Adhérent</th>
                  <th>Contact</th>
                  <th>Livre</th>
                  <th>Date limite</th>
                  <th>Retard constaté</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="loan in overdueLoans" :key="loan.id">

                  <td>
                    <div class="font-bold text-dark">
                      {{ loan.member?.first_name }} {{ loan.member?.last_name }}
                    </div>
                  </td>

                  <td>
                    <div class="text-sm">📧 {{ loan.member?.user?.email || loan.member?.email }}</div>
                    <div class="text-sm text-muted">📞 {{ loan.member?.phone || 'Non renseigné' }}</div>
                  </td>

                  <td>
                    <div class="font-bold text-dark">{{ loan.book_copy?.book?.title }}</div>
                    <div class="text-muted text-sm">Réf: {{ loan.book_copy?.reference }}</div>
                  </td>

                  <td>{{ formaterDate(loan.due_date) }}</td>

                  <td>
                    <span class="badge-late">
                      {{ labelRetard(loan.due_date) }}
                    </span>
                  </td>

                  <td>
                    <div class="actions-cell">
                      <RouterLink
                        :to="`/admin/loans/return?loan_id=${loan.id}`"
                        class="btn-sm btn-return"
                      >
                        Enregistrer retour
                      </RouterLink>

                      <button
                        class="btn-sm btn-notify"
                        @click="sendManualReminder(loan)"
                        :disabled="sendingId === loan.id"
                      >
                        <span v-if="sendingId === loan.id">Envoi...</span>
                        <span v-else>Envoyer relance</span>
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
import { loansService } from '@/services/loansService'
import api from '@/services/api'
import { formaterDate, labelRetard } from '@/utils/dates'

const loading = ref(true)
const overdueLoans = ref([])
const sendingId = ref(null)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

async function fetchOverdue() {
  loading.value = true
  try {
    const res = await loansService.getOverdue()
    overdueLoans.value = res.data || []
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de récupérer les retards.'
  } finally {
    loading.value = false
  }
}

async function sendManualReminder(loan) {
  sendingId.value = loan.id
  actionAlert.message = ''

  try {
    await api.post('/notifications/send', {
      member_id: loan.member_id || loan.member?.id,
      loan_id: loan.id,
      type: 'overdue',
      message: `Rappel de retard : Le livre '${loan.book_copy?.book?.title}' devait être rendu le ${formaterDate(loan.due_date)}.`
    })
    actionAlert.type = 'succes'
    actionAlert.message = `Relance envoyée avec succès à ${loan.member?.first_name} ${loan.member?.last_name}.`
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de l'envoi de la relance."
  } finally {
    sendingId.value = null
  }
}

onMounted(() => {
  fetchOverdue()
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

.badge-late {
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.btn-return {
  background: #2563eb;
  color: white;
}
.btn-return:hover { background: #1d4ed8; }

.btn-notify {
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}
.btn-notify:hover:not(:disabled) { background: #e2e8f0; }

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
