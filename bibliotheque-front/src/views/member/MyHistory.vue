<template>
  <div class="member-space">
    <div class="container">

      <!-- ── EN-TÊTE ──────────────────────────────────────── -->
      <div class="member-header">
        <div class="welcome-text">
          <h1>Mon Historique d'Emprunts</h1>
          <p>Consultez l'ensemble des ouvrages que vous avez déjà empruntés et retournés.</p>
        </div>
        <RouterLink to="/catalogue" class="btn btn-primary">
          Emprunter un livre
        </RouterLink>
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
        <RouterLink to="/member/history" class="tab-item active">
          Historique ({{ returnedLoans.length }})
        </RouterLink>
        <RouterLink to="/member/notifications" class="tab-item">
          Notifications
        </RouterLink>
        <RouterLink to="/member/profile" class="tab-item">
          Mon profil
        </RouterLink>
      </nav>

      <!-- ── STATISTIQUES LECTURE RAPIDES ──────────────────── -->
      <div class="stats-bar">
        <div class="stat-pill">
          <span class="stat-val">{{ returnedLoans.length }}</span>
          <span class="stat-lbl">Livre(s) lu(s) au total</span>
        </div>
        <div class="stat-pill">
          <span class="stat-val">{{ onTimeReturnsCount }}</span>
          <span class="stat-lbl">Retour(s) dans les délais</span>
        </div>
        <div class="stat-pill">
          <span class="stat-val text-danger">{{ lateReturnsCount }}</span>
          <span class="stat-lbl">Retour(s) avec retard</span>
        </div>
      </div>

      <!-- ── CONTENU PRINCIPAL ─────────────────────────────── -->
      <div class="section-card">

        <!-- Barre de filtre -->
        <div class="table-toolbar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par titre ou auteur..."
            class="search-input"
          />
          <select v-model="filterYear" class="filter-select">
            <option value="all">Toutes les années</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              Année {{ year }}
            </option>
          </select>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="loading-box">
          <Chargement message="Chargement de votre historique de lecture..." />
        </div>

        <!-- État vide -->
        <div v-else-if="filteredLoans.length === 0" class="empty-box">
          <p v-if="searchQuery || filterYear !== 'all'">
            Aucun historique ne correspond à vos critères de recherche.
          </p>
          <template v-else>
            <p>Vous n'avez pas encore d'historique d'emprunts clôturés.</p>
            <RouterLink to="/catalogue" class="btn btn-outline-primary">
              Découvrir le catalogue
            </RouterLink>
          </template>
        </div>

        <!-- Tableau d'historique -->
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Livre</th>
                <th>Réf. exemplaire</th>
                <th>Date d'emprunt</th>
                <th>Date prévue</th>
                <th>Date de retour effectif</th>
                <th>Bilan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in filteredLoans" :key="loan.id">

                <!-- Titre + Auteur + Couverture -->
                <td class="book-cell">
                  <img
                    v-if="loan.book_copy?.book?.cover_url"
                    :src="loan.book_copy?.book?.cover_url"
                    :alt="loan.book_copy?.book?.title"
                    class="book-mini-cover"
                  />
                  <div class="book-info">
                    <RouterLink
                      :to="`/catalogue/${loan.book_copy?.book?.id}`"
                      class="book-title"
                    >
                      {{ loan.book_copy?.book?.title || 'Titre inconnu' }}
                    </RouterLink>
                    <span class="book-author">{{ loan.book_copy?.book?.author }}</span>
                  </div>
                </td>

                <!-- Référence exemplaire -->
                <td>
                  <code class="ref-code">{{ loan.book_copy?.reference || 'N/A' }}</code>
                </td>

                <!-- Date emprunt -->
                <td>{{ formaterDate(loan.loaned_at) }}</td>

                <!-- Date prévue -->
                <td>{{ formaterDate(loan.due_date) }}</td>

                <!-- Date retour effectif -->
                <td class="font-semibold">
                  {{ formaterDate(loan.returned_at) }}
                </td>

                <!-- Bilan / Ponctualité -->
                <td>
                  <span
                    class="status-pill"
                    :class="wasReturnedLate(loan) ? 'status-late' : 'status-ok'"
                  >
                    {{ wasReturnedLate(loan) ? 'Retour tardif' : 'Retour dans les délais' }}
                  </span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loansService } from '@/services/loansService'
import { formaterDate } from '@/utils/dates'
import Chargement from '@/components/common/Chargement.vue'

const loading = ref(true)
const returnedLoans = ref([])
const searchQuery = ref('')
const filterYear = ref('all')

function wasReturnedLate(loan) {
  if (!loan.returned_at || !loan.due_date) return false
  return new Date(loan.returned_at) > new Date(loan.due_date)
}

const onTimeReturnsCount = computed(() =>
  returnedLoans.value.filter((l) => !wasReturnedLate(l)).length
)

const lateReturnsCount = computed(() =>
  returnedLoans.value.filter((l) => wasReturnedLate(l)).length
)

const availableYears = computed(() => {
  const years = new Set()
  returnedLoans.value.forEach((l) => {
    if (l.returned_at) {
      years.add(new Date(l.returned_at).getFullYear())
    }
  })
  return Array.from(years).sort((a, b) => b - a)
})

const filteredLoans = computed(() => {
  return returnedLoans.value.filter((loan) => {
    // Filtre texte
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const title = loan.book_copy?.book?.title?.toLowerCase() || ''
      const author = loan.book_copy?.book?.author?.toLowerCase() || ''
      const refCode = loan.book_copy?.reference?.toLowerCase() || ''
      if (!title.includes(q) && !author.includes(q) && !refCode.includes(q)) {
        return false
      }
    }

    // Filtre année
    if (filterYear.value !== 'all') {
      const loanYear = loan.returned_at ? new Date(loan.returned_at).getFullYear() : null
      if (loanYear !== Number(filterYear.value)) {
        return false
      }
    }

    return true
  })
})

async function fetchHistory() {
  loading.value = true
  try {
    const res = await loansService.getMine()
    // Ne garder que les emprunts clôturés / retournés
    returnedLoans.value = (res.data || []).filter((l) => l.status === 'returned')
  } catch (err) {
    console.error('Erreur lors du chargement de l’historique', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistory()
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

/* ── STATS BAR ─────────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-pill {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 180px;
}

.stat-val {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a237e;
}

.stat-lbl {
  font-size: 0.85rem;
  color: #666;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  height: 40px;
  width: 320px;
  padding: 0 0.9rem;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.search-input:focus, .filter-select:focus {
  border-color: #1a237e;
}

.filter-select {
  height: 40px;
  padding: 0 1rem;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  color: #333;
  outline: none;
}

/* ── DATA TABLE ────────────────────────────────────────── */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.9rem 1rem;
  background: #f8f9fa;
  color: #555;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #e0e0e0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  vertical-align: middle;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.book-mini-cover {
  width: 44px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.book-info {
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 600;
  color: #1a237e;
  text-decoration: none;
}

.book-title:hover {
  text-decoration: underline;
}

.book-author {
  font-size: 0.8rem;
  color: #777;
}

.ref-code {
  background: #f1f3f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #495057;
}

.font-semibold {
  font-weight: 600;
  color: #333;
}

.status-pill {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-late {
  background: #ffebee;
  color: #c62828;
}

.text-danger { color: #c62828; }

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

.btn-primary {
  background: #1a237e;
  color: white;
}
.btn-primary:hover {
  background: #11195f;
}

.btn-outline-primary {
  border: 1px solid #1a237e;
  color: #1a237e;
  background: white;
}
.btn-outline-primary:hover {
  background: #f0f4ff;
}

.loading-box, .empty-box {
  padding: 4rem 1rem;
  text-align: center;
  color: #777;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
