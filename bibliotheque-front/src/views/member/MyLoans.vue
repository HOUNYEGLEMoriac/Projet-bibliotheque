<template>
  <div class="member-space">
    <div class="container">

      <!-- ── EN-TÊTE ──────────────────────────────────────── -->
      <div class="member-header">
        <div class="welcome-text">
          <h1>Mes Emprunts</h1>
          <p>Suivez vos livres empruntés et gérez vos renouvellements.</p>
        </div>
        <RouterLink to="/catalogue" class="btn btn-primary">
          Emprunter un autre livre
        </RouterLink>
      </div>

      <!-- ── NAVIGATION ONGLETS ────────────────────────────── -->
      <nav class="member-tabs">
        <RouterLink to="/member/dashboard" class="tab-item">
          Vue d'ensemble
        </RouterLink>
        <RouterLink to="/member/loans" class="tab-item active">
          Mes emprunts ({{ activeLoans.length }})
        </RouterLink>
        <RouterLink to="/member/reservations" class="tab-item">
          Mes réservations
        </RouterLink>
        <RouterLink to="/member/history" class="tab-item">
          Historique
        </RouterLink>
        <RouterLink to="/member/notifications" class="tab-item">
          Notifications
        </RouterLink>
        <RouterLink to="/member/profile" class="tab-item">
          Mon profil
        </RouterLink>
      </nav>

      <!-- ── RECAPITULATIF QUOTA & ALERTES ─────────────────── -->
      <div class="quota-banner">
        <div class="quota-info">
          <span class="quota-title">Quota d'emprunt</span>
          <span class="quota-value"><strong>{{ activeLoans.length }}</strong> / 3 livres empruntés</span>
        </div>
        <div class="quota-progress-wrapper">
          <div
            class="quota-progress-bar"
            :style="{ width: `${(activeLoans.length / 3) * 100}%` }"
            :class="{ 'quota-full': activeLoans.length >= 3 }"
          ></div>
        </div>
      </div>

      <!-- Alertes d'action (Succès / Erreur) -->
      <Alerte
        v-if="actionAlert.message"
        :message="actionAlert.message"
        :type="actionAlert.type"
        :duree="5000"
        @fermer="actionAlert.message = ''"
      />

      <!-- ── CONTENU PRINCIPAL ─────────────────────────────── -->
      <div class="section-card">

        <!-- Barre d'outils (recherche & filtre) -->
        <div class="table-toolbar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filtrer par titre ou auteur..."
            class="search-input"
          />
          <div class="status-legend">
            <span class="legend-item"><span class="dot dot-active"></span> En cours</span>
            <span class="legend-item"><span class="dot dot-overdue"></span> En retard</span>
          </div>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="loading-box">
          <Chargement message="Récupération de vos emprunts..." />
        </div>

        <!-- État vide -->
        <div v-else-if="filteredLoans.length === 0" class="empty-box">
          <p v-if="searchQuery">Aucun emprunt ne correspond à votre recherche.</p>
          <template v-else>
            <p>Vous n'avez aucun livre en cours d'emprunt actuellement.</p>
            <RouterLink to="/catalogue" class="btn btn-outline-primary">
              Explorer le catalogue
            </RouterLink>
          </template>
        </div>

        <!-- Tableau des emprunts -->
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Livre</th>
                <th>Réf. exemplaire</th>
                <th>Date d'emprunt</th>
                <th>Date limite</th>
                <th>Statut</th>
                <th>Action</th>
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
                      {{ loan.book_copy?.book?.title }}
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

                <!-- Date limite & Décompte -->
                <td>
                  <div :class="{ 'text-danger font-bold': estEnRetard(loan.due_date) }">
                    {{ formaterDate(loan.due_date) }}
                  </div>
                  <div
                    class="countdown-text"
                    :class="estEnRetard(loan.due_date) ? 'text-danger' : 'text-muted'"
                  >
                    {{ labelRetard(loan.due_date) }}
                  </div>
                </td>

                <!-- Statut -->
                <td>
                  <span
                    class="status-pill"
                    :class="estEnRetard(loan.due_date) ? 'status-overdue' : 'status-active'"
                  >
                    {{ estEnRetard(loan.due_date) ? 'En retard' : 'En règle' }}
                  </span>
                </td>

                <!-- Prolongation -->
                <td>
                  <button
                    class="btn-renew"
                    :disabled="loan.renewed_count >= 1 || estEnRetard(loan.due_date) || renewingId === loan.id"
                    @click="renewLoan(loan.id)"
                  >
                    <span v-if="renewingId === loan.id">Traitement...</span>
                    <span v-else-if="loan.renewed_count >= 1">Déjà prolongé</span>
                    <span v-else-if="estEnRetard(loan.due_date)">Non prolongeable</span>
                    <span v-else>Prolonger (+15 j)</span>
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
import { ref, computed, onMounted, reactive } from 'vue'
import { loansService } from '@/services/loansService'
import { formaterDate, estEnRetard, labelRetard } from '@/utils/dates'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'

const loading = ref(true)
const activeLoans = ref([])
const searchQuery = ref('')
const renewingId = ref(null)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

const filteredLoans = computed(() => {
  if (!searchQuery.value.trim()) return activeLoans.value
  const q = searchQuery.value.toLowerCase()
  return activeLoans.value.filter((loan) => {
    const title = loan.book_copy?.book?.title?.toLowerCase() || ''
    const author = loan.book_copy?.book?.author?.toLowerCase() || ''
    const refCode = loan.book_copy?.reference?.toLowerCase() || ''
    return title.includes(q) || author.includes(q) || refCode.includes(q)
  })
})

async function fetchMyLoans() {
  loading.value = true
  try {
    const res = await loansService.getMine()
    // Ne garder que les emprunts actifs ou en retard (non retournés)
    activeLoans.value = (res.data || []).filter(
      (l) => l.status === 'active' || l.status === 'overdue'
    )
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors du chargement des emprunts.'
  } finally {
    loading.value = false
  }
}

async function renewLoan(loanId) {
  renewingId.value = loanId
  actionAlert.message = ''

  try {
    const res = await loansService.renew(loanId)
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Emprunt prolongé de 15 jours avec succès.'
      await fetchMyLoans()
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de prolonger cet emprunt.'
  } finally {
    renewingId.value = null
  }
}

onMounted(() => {
  fetchMyLoans()
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

/* ── QUOTA BANNER ──────────────────────────────────────── */
.quota-banner {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.quota-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
}

.quota-title {
  font-weight: 600;
}

.quota-progress-wrapper {
  height: 8px;
  background: #eef1f6;
  border-radius: 4px;
  overflow: hidden;
}

.quota-progress-bar {
  height: 100%;
  background: #1a237e;
  transition: width 0.3s ease;
}

.quota-full {
  background: #e53935;
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

.search-input:focus {
  border-color: #1a237e;
}

.status-legend {
  display: flex;
  gap: 1.2rem;
  font-size: 0.85rem;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-active { background: #2e7d32; }
.dot-overdue { background: #c62828; }

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

.countdown-text {
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.text-muted { color: #666; }
.text-danger { color: #c62828; }
.font-bold { font-weight: 700; }

.status-pill {
  display: inline-block;
  padding: 0.3rem 0.7rem;
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

.btn-renew {
  background: white;
  border: 1.5px solid #1a237e;
  color: #1a237e;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-renew:hover:not(:disabled) {
  background: #1a237e;
  color: white;
}

.btn-renew:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ced4da;
  color: #888;
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
