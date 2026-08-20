<template>
  <div class="member-space">
    <div class="container">

      <!-- ── EN-TÊTE BIENVENUE ──────────────────────────────── -->
      <div class="member-header">
        <div class="welcome-text">
          <h1>Bonjour, {{ authStore.user?.first_name }}</h1>
          <p>Bienvenue sur votre tableau de bord personnel.</p>
        </div>
        <RouterLink to="/catalogue" class="btn btn-primary">
          Parcourir le catalogue
        </RouterLink>
      </div>

      <!-- ── NAVIGATION ESPACE MEMBRE (ONGLETS) ─────────────── -->
      <nav class="member-tabs">
        <RouterLink to="/member/dashboard" class="tab-item active">
          Vue d'ensemble
        </RouterLink>
        <RouterLink to="/member/loans" class="tab-item">
          Mes emprunts ({{ activeLoansCount }})
        </RouterLink>
        <RouterLink to="/member/reservations" class="tab-item">
          Mes réservations ({{ reservationsCount }})
        </RouterLink>
        <RouterLink to="/member/history" class="tab-item">
          Historique
        </RouterLink>
        <RouterLink to="/member/notifications" class="tab-item">
          Notifications
          <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
        </RouterLink>
        <RouterLink to="/member/profile" class="tab-item">
          Mon profil
        </RouterLink>
      </nav>

      <!-- ── CARTES DE STATISTIQUES RAPIDES ────────────────── -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <span class="stat-number">{{ activeLoansCount }} / 3</span>
            <span class="stat-label">Emprunts en cours</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-number">{{ reservationsCount }}</span>
            <span class="stat-label">Réservation(s) active(s)</span>
          </div>
        </div>

        <div class="stat-card" :class="{ 'stat-alert': overdueLoansCount > 0 }">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <span class="stat-number">{{ overdueLoansCount }}</span>
            <span class="stat-label">Emprunt(s) en retard</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🔔</div>
          <div class="stat-info">
            <span class="stat-number">{{ unreadCount }}</span>
            <span class="stat-label">Notification(s) non lue(s)</span>
          </div>
        </div>
      </div>

      <!-- ── EMPRUNTS EN COURS (PRIORITÉ) ───────────────────── -->
      <div class="section-card">
        <div class="section-card-header">
          <h2>Mes emprunts en cours</h2>
          <RouterLink to="/member/loans" class="link-more">
            Voir tous mes emprunts →
          </RouterLink>
        </div>

        <div v-if="loading" class="loading-box">
          <Chargement message="Chargement de vos emprunts..." />
        </div>

        <div v-else-if="activeLoans.length === 0" class="empty-box">
          <p>Vous n'avez aucun livre emprunté actuellement.</p>
          <RouterLink to="/catalogue" class="btn btn-outline-primary">
            Trouver un livre à emprunter
          </RouterLink>
        </div>

        <div v-else class="loans-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Livre</th>
                <th>Date d'emprunt</th>
                <th>Date limite de retour</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in activeLoans" :key="loan.id">
                <td class="book-cell">
                  <div class="book-cell-content">
                    <img
                      v-if="loan.book_copy?.book?.cover_url"
                      :src="loan.book_copy?.book?.cover_url"
                      :alt="loan.book_copy?.book?.title"
                      class="book-mini-cover"
                    />
                    <div>
                      <RouterLink
                        :to="`/catalogue/${loan.book_copy?.book?.id}`"
                        class="book-title-link"
                      >
                        {{ loan.book_copy?.book?.title || 'Titre inconnu' }}
                      </RouterLink>
                      <div class="book-author-text">
                        {{ loan.book_copy?.book?.author }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ formaterDate(loan.loaned_at) }}</td>
                <td>
                  <span :class="{ 'text-danger font-bold': estEnRetard(loan.due_date) }">
                    {{ formaterDate(loan.due_date) }}
                  </span>
                  <div class="countdown-badge" :class="estEnRetard(loan.due_date) ? 'badge-danger' : 'badge-info'">
                    {{ labelRetard(loan.due_date) }}
                  </div>
                </td>
                <td>
                  <span
                    class="status-pill"
                    :class="estEnRetard(loan.due_date) ? 'status-overdue' : 'status-active'"
                  >
                    {{ estEnRetard(loan.due_date) ? 'En retard' : 'En cours' }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn-sm btn-renew"
                    :disabled="loan.renewed_count >= 1 || estEnRetard(loan.due_date)"
                    @click="handleRenew(loan.id)"
                  >
                    {{ loan.renewed_count >= 1 ? 'Prolongé' : 'Prolonger (15j)' }}
                  </button>
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
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { loansService } from '@/services/loansService'
import { reservationsService } from '@/services/reservationsService'
import { formaterDate, estEnRetard, labelRetard } from '@/utils/dates'
import Chargement from '@/components/common/Chargement.vue'

const authStore = useAuthStore()
const notifStore = useNotificationsStore()

const loading = ref(true)
const activeLoans = ref([])
const reservations = ref([])

const activeLoansCount = computed(() => activeLoans.value.length)
const reservationsCount = computed(() => reservations.value.length)
const overdueLoansCount = computed(() =>
  activeLoans.value.filter((l) => estEnRetard(l.due_date)).length
)
const unreadCount = computed(() => notifStore.unreadCount)

async function loadDashboardData() {
  loading.value = true
  try {
    const [loansRes, resRes] = await Promise.all([
      loansService.getMine(),
      reservationsService.getMine(),
      notifStore.fetchMine()
    ])
    activeLoans.value = (loansRes.data || []).filter((l) => l.status === 'active')
    reservations.value = (resRes.data || []).filter((r) => r.status === 'pending' || r.status === 'ready')
  } catch (err) {
    console.error('Erreur chargement dashboard membre', err)
  } finally {
    loading.value = false
  }
}

async function handleRenew(loanId) {
  try {
    const res = await loansService.renew(loanId)
    if (res.success) {
      await loadDashboardData()
    }
  } catch (err) {
    alert(err.message || 'Impossible de prolonger cet emprunt.')
  }
}

onMounted(() => {
  loadDashboardData()
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
  position: relative;
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
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-alert {
  border-color: #ffcdd2;
  background: #ffebee;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a237e;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

/* ── SECTION CARD & TABLE ──────────────────────────────── */
.section-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 1.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.section-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-card-header h2 {
  font-size: 1.25rem;
  color: #1a237e;
  font-weight: 700;
}

.link-more {
  color: #1a237e;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.link-more:hover {
  text-decoration: underline;
}

.loans-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.8rem 1rem;
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

.book-cell-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.book-mini-cover {
  width: 40px;
  height: 55px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.book-title-link {
  font-weight: 600;
  color: #1a237e;
  text-decoration: none;
}

.book-title-link:hover {
  text-decoration: underline;
}

.book-author-text {
  font-size: 0.8rem;
  color: #777;
}

.countdown-badge {
  font-size: 0.75rem;
  margin-top: 0.2rem;
  font-weight: 500;
}

.badge-danger { color: #c62828; }
.badge-info { color: #555; }

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-overdue {
  background: #ffebee;
  color: #c62828;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.btn-renew {
  background: white;
  border: 1px solid #1a237e;
  color: #1a237e;
  transition: all 0.2s;
}

.btn-renew:hover:not(:disabled) {
  background: #1a237e;
  color: white;
}

.btn-renew:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #888;
}

.font-bold { font-weight: 700; }
.text-danger { color: #c62828; }

.empty-box {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #777;
}

.loading-box {
  padding: 3rem 0;
}
</style>
