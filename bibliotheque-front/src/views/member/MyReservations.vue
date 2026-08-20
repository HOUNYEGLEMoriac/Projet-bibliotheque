<template>
  <div class="member-space">
    <div class="container">

      <!-- ── EN-TÊTE ──────────────────────────────────────── -->
      <div class="member-header">
        <div class="welcome-text">
          <h1>Mes Réservations</h1>
          <p>Suivez l'état d'avancement de vos demandes en liste d'attente.</p>
        </div>
        <RouterLink to="/catalogue" class="btn btn-primary">
          Réserver un autre ouvrage
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
        <RouterLink to="/member/reservations" class="tab-item active">
          Mes réservations ({{ reservations.length }})
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

      <!-- ── BANDEAU INFORMATIF SUR LES RÈGLES ─────────────── -->
      <div class="info-banner">
        <div class="info-title">Fonctionnement des réservations</div>
        <p class="info-desc">
          Lorsqu'un livre indisponible est retourné, la réservation prioritaire passe au statut <strong>"Prêt à retirer"</strong>. Vous disposez alors de <strong>5 jours</strong> pour venir le récupérer à l'accueil avant qu'il ne soit proposé au lecteur suivant.
        </p>
      </div>

      <!-- Alertes d'action -->
      <Alerte
        v-if="actionAlert.message"
        :message="actionAlert.message"
        :type="actionAlert.type"
        :duree="5000"
        @fermer="actionAlert.message = ''"
      />

      <!-- ── CONTENU PRINCIPAL ─────────────────────────────── -->
      <div class="section-card">

        <!-- Chargement -->
        <div v-if="loading" class="loading-box">
          <Chargement message="Récupération de vos réservations..." />
        </div>

        <!-- État vide -->
        <div v-else-if="reservations.length === 0" class="empty-box">
          <p>Vous n'avez aucune réservation en cours actuellement.</p>
          <RouterLink to="/catalogue" class="btn btn-outline-primary">
            Consulter les ouvrages du catalogue
          </RouterLink>
        </div>

        <!-- Tableau des réservations -->
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Livre</th>
                <th>Date de demande</th>
                <th>Position en file</th>
                <th>Statut</th>
                <th>Date limite de retrait</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in reservations" :key="res.id">

                <!-- Titre + Auteur + Couverture -->
                <td class="book-cell">
                  <img
                    v-if="res.book?.cover_url"
                    :src="res.book?.cover_url"
                    :alt="res.book?.title"
                    class="book-mini-cover"
                  />
                  <div class="book-info">
                    <RouterLink
                      :to="`/catalogue/${res.book?.id}`"
                      class="book-title"
                    >
                      {{ res.book?.title || 'Titre indisponible' }}
                    </RouterLink>
                    <span class="book-author">{{ res.book?.author }}</span>
                  </div>
                </td>

                <!-- Date réservation -->
                <td>{{ formaterDate(res.reserved_at) }}</td>

                <!-- Position dans la file -->
                <td>
                  <span v-if="res.status === 'pending'" class="queue-badge">
                    Rang n° {{ res.position }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>

                <!-- Statut -->
                <td>
                  <span
                    class="status-pill"
                    :class="res.status === 'ready' ? 'status-ready' : 'status-pending'"
                  >
                    {{ res.status === 'ready' ? 'Prêt à retirer' : 'En attente' }}
                  </span>
                </td>

                <!-- Date limite si ready -->
                <td>
                  <span v-if="res.status === 'ready'" class="font-bold text-success">
                    Jusqu'au {{ formaterDate(res.expires_at) }}
                  </span>
                  <span v-else class="text-muted">En attente de retour</span>
                </td>

                <!-- Annulation -->
                <td>
                  <button
                    class="btn-cancel"
                    :disabled="cancellingId === res.id"
                    @click="handleCancel(res.id)"
                  >
                    <span v-if="cancellingId === res.id">Annulation...</span>
                    <span v-else>Annuler</span>
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
import { ref, onMounted, reactive } from 'vue'
import { reservationsService } from '@/services/reservationsService'
import { formaterDate } from '@/utils/dates'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'

const loading = ref(true)
const reservations = ref([])
const cancellingId = ref(null)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

async function fetchMyReservations() {
  loading.value = true
  try {
    const res = await reservationsService.getMine()
    // Ne garder que les réservations actives ('pending' ou 'ready')
    reservations.value = (res.data || []).filter(
      (r) => r.status === 'pending' || r.status === 'ready'
    )
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors du chargement des réservations.'
  } finally {
    loading.value = false
  }
}

async function handleCancel(reservationId) {
  if (!confirm('Confirmez-vous l’annulation de cette réservation ?')) return

  cancellingId.value = reservationId
  actionAlert.message = ''

  try {
    const res = await reservationsService.cancel(reservationId)
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Réservation annulée avec succès.'
      await fetchMyReservations()
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible d’annuler cette réservation.'
  } finally {
    cancellingId.value = null
  }
}

onMounted(() => {
  fetchMyReservations()
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

/* ── BANNER ────────────────────────────────────────────── */
.info-banner {
  background: #e8eaf6;
  border-left: 4px solid #1a237e;
  border-radius: 6px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 2rem;
}

.info-title {
  font-weight: 700;
  color: #1a237e;
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
}

.info-desc {
  font-size: 0.9rem;
  color: #455a64;
  line-height: 1.5;
}

/* ── SECTION CARD ──────────────────────────────────────── */
.section-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 1.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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

.queue-badge {
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
}

.status-pill {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pending {
  background: #fff8e1;
  color: #f57f17;
}

.status-ready {
  background: #e8f5e9;
  color: #2e7d32;
}

.text-muted { color: #888; }
.text-success { color: #2e7d32; }
.font-bold { font-weight: 700; }

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

.btn-cancel {
  background: white;
  border: 1px solid #c62828;
  color: #c62828;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #ffebee;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
