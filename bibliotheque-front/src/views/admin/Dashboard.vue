<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── TITRE ET ACTIONS RAPIDES ──────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Tableau de bord de gestion</h1>
            <p>Vue synthétique des activités de la bibliothèque.</p>
          </div>
          <div class="header-actions">
            <RouterLink to="/admin/loans/return" class="btn btn-secondary">
              Enregistrer un retour
            </RouterLink>
            <RouterLink to="/admin/books/add" class="btn btn-primary">
              Ajouter un livre
            </RouterLink>
          </div>
        </div>

        <!-- ── STATS CARTES (KPIs) ────────────────────────────── -->
        <div class="stats-grid">

          <div class="stat-card">
            <span class="stat-title">Emprunts en cours</span>
            <div class="stat-main">
              <span class="stat-value">{{ stats.activeLoans }}</span>
            </div>
            <span class="stat-sub">Sur {{ stats.totalCopies }} exemplaires gérés</span>
          </div>

          <div class="stat-card stat-warning" :class="{ 'stat-danger': stats.overdueLoans > 0 }">
            <span class="stat-title">Emprunts en retard</span>
            <div class="stat-main">
              <span class="stat-value">{{ stats.overdueLoans }}</span>
            </div>
            <span class="stat-sub">Nécessite relance ou pénalité</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Réservations actives</span>
            <div class="stat-main">
              <span class="stat-value">{{ stats.pendingReservations }}</span>
            </div>
            <span class="stat-sub">Dont {{ stats.readyReservations }} prête(s) à retirer</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Adhérents inscrits</span>
            <div class="stat-main">
              <span class="stat-value">{{ stats.totalMembers }}</span>
            </div>
            <span class="stat-sub">{{ stats.activeMembers }} compte(s) actif(s)</span>
          </div>

        </div>

        <!-- ── GRILLE PRINCIPALE (RETARDS CRITIQUES & EMPRUNTS RECENTS) ── -->
        <div class="dashboard-grid">

          <!-- Colonne Gauche : Emprunts en retard prioritaires -->
          <div class="panel-card">
            <div class="panel-header">
              <h2>Retards à traiter en priorité</h2>
              <RouterLink to="/admin/loans/overdue" class="panel-link">
                Voir tous les retards ({{ overdueList.length }}) →
              </RouterLink>
            </div>

            <div v-if="loadingOverdue" class="loading-box">
              <Chargement message="Chargement des retards..." />
            </div>

            <div v-else-if="overdueList.length === 0" class="empty-box">
              <p>Aucun emprunt en retard actuellement.</p>
            </div>

            <div v-else class="table-wrapper">
              <table class="panel-table">
                <thead>
                  <tr>
                    <th>Adhérent</th>
                    <th>Livre</th>
                    <th>Échéance</th>
                    <th>Retard</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in overdueList.slice(0, 5)" :key="loan.id">
                    <td>
                      <strong>{{ loan.member?.first_name }} {{ loan.member?.last_name }}</strong>
                    </td>
                    <td>{{ loan.book_copy?.book?.title }}</td>
                    <td>{{ formaterDate(loan.due_date) }}</td>
                    <td>
                      <span class="badge-late">
                        {{ labelRetard(loan.due_date) }}
                      </span>
                    </td>
                    <td>
                      <RouterLink
                        :to="`/admin/loans/return?loan_id=${loan.id}`"
                        class="btn-sm btn-action"
                      >
                        Retourner
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Colonne Droite : Derniers emprunts enregistrés -->
          <div class="panel-card">
            <div class="panel-header">
              <h2>Derniers emprunts accordés</h2>
              <RouterLink to="/admin/loans" class="panel-link">
                Tous les emprunts →
              </RouterLink>
            </div>

            <div v-if="loadingRecent" class="loading-box">
              <Chargement message="Chargement..." />
            </div>

            <div v-else-if="recentLoans.length === 0" class="empty-box">
              <p>Aucun emprunt récent.</p>
            </div>

            <div v-else class="table-wrapper">
              <table class="panel-table">
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Adhérent</th>
                    <th>Date d'emprunt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in recentLoans.slice(0, 5)" :key="loan.id">
                    <td>
                      <span class="font-semibold">{{ loan.book_copy?.book?.title }}</span>
                    </td>
                    <td>{{ loan.member?.first_name }} {{ loan.member?.last_name }}</td>
                    <td>{{ formaterDate(loan.loaned_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
import api from '@/services/api'
import { formaterDate, labelRetard } from '@/utils/dates'

const loadingOverdue = ref(true)
const loadingRecent = ref(true)

const stats = ref({
  activeLoans: 0,
  overdueLoans: 0,
  pendingReservations: 0,
  readyReservations: 0,
  totalMembers: 0,
  activeMembers: 0,
  totalCopies: 0
})

const overdueList = ref([])
const recentLoans = ref([])

async function fetchStats() {
  try {
    const res = await api.get('/dashboard/stats')
    if (res.data) {
      stats.value = { ...stats.value, ...res.data }
    }
  } catch (err) {
    console.error('Erreur stats admin', err)
  }
}

async function fetchOverdueLoans() {
  loadingOverdue.value = true
  try {
    const res = await loansService.getOverdue()
    overdueList.value = res.data || []
  } catch (err) {
    console.error('Erreur emprunts en retard', err)
  } finally {
    loadingOverdue.value = false
  }
}

async function fetchRecentLoans() {
  loadingRecent.value = true
  try {
    const res = await api.get('/dashboard/recent-loans')
    recentLoans.value = res.data || []
  } catch (err) {
    console.error('Erreur emprunts récents', err)
  } finally {
    loadingRecent.value = false
  }
}

onMounted(() => {
  fetchStats()
  fetchOverdueLoans()
  fetchRecentLoans()
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

/* ── HEADER ────────────────────────────────────────────── */
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

.header-actions {
  display: flex;
  gap: 0.8rem;
}

/* ── STATS CARDS ───────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
}

.stat-main {
  margin-bottom: 0.4rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-sub {
  font-size: 0.82rem;
  color: #94a3b8;
}

.stat-danger {
  border-color: #fecaca;
  background: #fff5f5;
}

.stat-danger .stat-value {
  color: #dc2626;
}

/* ── DASHBOARD GRID & PANELS ────────────────────────────── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
}

.panel-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.8rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.8rem;
}

.panel-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.panel-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

.panel-link:hover {
  text-decoration: underline;
}

.table-wrapper {
  overflow-x: auto;
}

.panel-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.panel-table th {
  padding: 0.6rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.panel-table td {
  padding: 0.8rem;
  font-size: 0.88rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.font-semibold {
  font-weight: 600;
  color: #1e293b;
}

.badge-late {
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

/* ── BOUTONS ────────────────────────────────────────────── */
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
  transition: background 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}
.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn-secondary:hover {
  background: #f8fafc;
}

.btn-sm {
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  border-radius: 4px;
}

.btn-action {
  background: #f1f5f9;
  color: #0f172a;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid #cbd5e1;
}

.btn-action:hover {
  background: #e2e8f0;
}

.loading-box, .empty-box {
  padding: 3rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}
</style>
