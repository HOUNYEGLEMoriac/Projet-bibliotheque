<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── EN-TÊTE ──────────────────────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Gestion des Adhérents</h1>
            <p>{{ totalMembers }} compte(s) adhérent(s) inscrit(s).</p>
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

          <!-- Barre d'outils (Recherche & Filtres) -->
          <div class="table-toolbar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              class="search-input"
              @input="handleFilterChange"
            />

            <div class="filters-group">
              <select v-model="statusFilter" @change="handleFilterChange" class="filter-select">
                <option value="">Tous les statuts</option>
                <option value="active">Comptes Actifs</option>
                <option value="inactive">Comptes Suspendus</option>
              </select>
            </div>
          </div>

          <!-- Chargement -->
          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement des adhérents..." />
          </div>

          <!-- État vide -->
          <div v-else-if="members.length === 0" class="empty-box">
            <p>Aucun adhérent ne correspond aux critères.</p>
          </div>

          <!-- Tableau des adhérents -->
          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Adhérent</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Date d'inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in members" :key="member.id">

                  <td>
                    <div class="font-bold text-dark">
                      {{ member.first_name }} {{ member.last_name }}
                    </div>
                  </td>

                  <td>{{ member.user?.email || member.email }}</td>
                  <td>{{ member.phone || 'Non renseigné' }}</td>

                  <td>
                    <span
                      class="status-pill"
                      :class="member.user?.is_active !== false ? 'status-active' : 'status-inactive'"
                    >
                      {{ member.user?.is_active !== false ? 'Actif' : 'Suspendu' }}
                    </span>
                  </td>

                  <td>{{ formaterDate(member.created_at) }}</td>

                  <td>
                    <div class="actions-cell">
                      <RouterLink
                        :to="`/admin/members/${member.id}`"
                        class="btn-icon"
                        title="Consulter le dossier"
                      >
                        👁
                      </RouterLink>

                      <button
                        v-if="member.user?.is_active !== false"
                        class="btn-icon btn-suspend"
                        title="Suspendre le compte"
                        @click="toggleStatus(member, false)"
                      >
                        ⏸
                      </button>

                      <button
                        v-else
                        class="btn-icon btn-activate"
                        title="Activer le compte"
                        @click="toggleStatus(member, true)"
                      >
                        ▶️
                      </button>
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
import { ref, reactive, onMounted } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'
import { membersService } from '@/services/membersService'
import { formaterDate } from '@/utils/dates'

const loading = ref(true)
const members = ref([])

const searchQuery = ref('')
const statusFilter = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const totalMembers = ref(0)
const limit = 10

const actionAlert = reactive({
  message: '',
  type: 'info'
})

async function fetchMembers() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined
    }

    const res = await membersService.getAll(params)
    members.value = res.data || []
    totalMembers.value = res.pagination?.total || members.value.length
    totalPages.value = res.pagination?.totalPages || 1
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de récupérer la liste des adhérents.'
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  currentPage.value = 1
  fetchMembers()
}

function changePage(page) {
  currentPage.value = page
  fetchMembers()
}

async function toggleStatus(member, activate) {
  const actionText = activate ? 'activer' : 'suspendre'
  if (!confirm(`Confirmez-vous vouloir ${actionText} le compte de ${member.first_name} ${member.last_name} ?`)) return

  try {
    if (activate) {
      await membersService.activate(member.id)
    } else {
      await membersService.deactivate(member.id)
    }
    actionAlert.type = 'succes'
    actionAlert.message = `Compte ${activate ? 'activé' : 'suspendu'} avec succès.`
    fetchMembers()
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors du changement de statut.'
  }
}

onMounted(() => {
  fetchMembers()
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
.text-dark { color: #0f172a; }

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: #dcfce7;
  color: #15803d;
}

.status-inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-suspend:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.btn-activate:hover {
  background: #dcfce7;
  border-color: #86efac;
}

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

.page-info {
  font-size: 0.85rem;
  color: #64748b;
}

.loading-box, .empty-box {
  padding: 4rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
