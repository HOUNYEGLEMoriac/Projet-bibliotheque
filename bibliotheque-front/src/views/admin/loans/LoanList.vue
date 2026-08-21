<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── EN-TÊTE ──────────────────────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Suivi des Emprunts</h1>
            <p>Gestion et historique global des flux d'emprunts de la bibliothèque.</p>
          </div>
          <RouterLink to="/admin/loans/return" class="btn btn-primary">
            Enregistrer un retour de livre
          </RouterLink>
        </div>

        <div class="panel-card">

          <!-- Barre d'outils -->
          <div class="table-toolbar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par adhérent ou titre de livre..."
              class="search-input"
              @input="handleFilterChange"
            />

            <div class="filters-group">
              <select v-model="statusFilter" @change="handleFilterChange" class="filter-select">
                <option value="">Tous les statuts</option>
                <option value="active">En cours</option>
                <option value="overdue">En retard</option>
                <option value="returned">Retournés</option>
              </select>
            </div>
          </div>

          <!-- Chargement -->
          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement des emprunts..." />
          </div>

          <!-- État vide -->
          <div v-else-if="loans.length === 0" class="empty-box">
            <p>Aucun emprunt trouvé.</p>
          </div>

          <!-- Tableau -->
          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Livre</th>
                  <th>Adhérent</th>
                  <th>Date d'emprunt</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="loan in loans" :key="loan.id">

                  <td>
                    <div class="font-bold text-dark">
                      {{ loan.book_copy?.book?.title }}
                    </div>
                    <div class="text-muted text-sm">
                      Réf: {{ loan.book_copy?.reference }}
                    </div>
                  </td>

                  <td>
                    <div class="font-medium text-dark">
                      {{ loan.member?.first_name }} {{ loan.member?.last_name }}
                    </div>
                    <div class="text-muted text-sm">
                      {{ loan.member?.user?.email || loan.member?.email }}
                    </div>
                  </td>

                  <td>{{ formaterDate(loan.loaned_at) }}</td>

                  <td>
                    <span :class="{ 'text-danger font-bold': loan.status === 'overdue' || (loan.status === 'active' && estEnRetard(loan.due_date)) }">
                      {{ formaterDate(loan.due_date) }}
                    </span>
                  </td>

                  <td>
                    <span
                      class="status-pill"
                      :class="getStatusClass(loan)"
                    >
                      {{ getStatusLabel(loan) }}
                    </span>
                  </td>

                  <td>
                    <div class="actions-cell">
                      <RouterLink
                        v-if="loan.status === 'active' || loan.status === 'overdue'"
                        :to="`/admin/loans/return?loan_id=${loan.id}`"
                        class="btn-sm btn-action"
                      >
                        Enregistrer retour
                      </RouterLink>
                      <span v-else class="text-muted text-sm">
                        Retourné le {{ formaterDate(loan.returned_at) }}
                      </span>
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-footer">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Précédent
            </button>
            <span class="page-info">Page {{ currentPage }} sur {{ totalPages }}</span>
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Suivant
            </button>
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
import { loansService } from '@/services/loansService'
import { formaterDate, estEnRetard } from '@/utils/dates'

const loading = ref(true)
const loans = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const limit = 10

function getStatusLabel(loan) {
  if (loan.status === 'returned') return 'Retourné'
  if (loan.status === 'overdue' || estEnRetard(loan.due_date)) return 'En retard'
  return 'En cours'
}

function getStatusClass(loan) {
  if (loan.status === 'returned') return 'status-returned'
  if (loan.status === 'overdue' || estEnRetard(loan.due_date)) return 'status-overdue'
  return 'status-active'
}

async function fetchLoans() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined
    }

    const res = await loansService.getAll(params)
    loans.value = res.data || []
    totalPages.value = res.pagination?.totalPages || 1
  } catch (err) {
    console.error('Erreur chargement emprunts', err)
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  currentPage.value = 1
  fetchLoans()
}

function changePage(page) {
  currentPage.value = page
  fetchLoans()
}

onMounted(() => {
  fetchLoans()
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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  height: 42px;
  width: 360px;
  padding: 0 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
}

.search-input:focus, .filter-select:focus {
  border-color: #2563eb;
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
.text-danger { color: #dc2626; }

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-active { background: #dcfce7; color: #15803d; }
.status-overdue { background: #fee2e2; color: #b91c1c; }
.status-returned { background: #f1f5f9; color: #64748b; }

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
}

.btn-action {
  background: #2563eb;
  color: white;
  border: none;
}
.btn-action:hover { background: #1d4ed8; }

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  padding: 0.45rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  border-color: #2563eb;
  color: #2563eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  height: 42px;
  padding: 0 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  color: white;
}
.btn-primary:hover {
  background: #1d4ed8;
}

.loading-box, .empty-box {
  padding: 4rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
