<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Dossier Adhérent</h1>
            <p>Consultation des coordonnées et des activités de prêt.</p>
          </div>
          <RouterLink to="/admin/members" class="btn btn-secondary">
            ← Retour à la liste des adhérents
          </RouterLink>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="loading-box">
          <Chargement message="Chargement du dossier..." />
        </div>

        <div v-else-if="member" class="member-detail-grid">

          <!-- Colonne Gauche : Identité & Contact -->
          <div class="panel-card">
            <div class="member-profile-header">
              <div class="avatar-circle">
                {{ member.first_name[0] }}{{ member.last_name[0] }}
              </div>
              <div>
                <h2>{{ member.first_name }} {{ member.last_name }}</h2>
                <span class="status-pill" :class="member.user?.is_active !== false ? 'status-active' : 'status-inactive'">
                  {{ member.user?.is_active !== false ? 'Compte Actif' : 'Compte Suspendu' }}
                </span>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span class="label">Email :</span>
                <span class="val">{{ member.user?.email || member.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">Téléphone :</span>
                <span class="val">{{ member.phone || 'Non renseigné' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Adresse :</span>
                <span class="val">{{ member.address || 'Non renseignée' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Inscrit le :</span>
                <span class="val">{{ formaterDate(member.created_at) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Quota max :</span>
                <span class="val">{{ member.max_loans || 3 }} livres simultanés</span>
              </div>
            </div>
          </div>

          <!-- Colonne Droite : Emprunts en cours & Réservations -->
          <div class="panel-card">
            <div class="tabs-header">
              <h2>Emprunts en cours ({{ activeLoans.length }})</h2>
            </div>

            <div v-if="activeLoans.length === 0" class="empty-sub">
              Aucun emprunt en cours.
            </div>

            <div v-else class="table-wrapper">
              <table class="mini-table">
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Échéance</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in activeLoans" :key="loan.id">
                    <td><strong>{{ loan.book_copy?.book?.title }}</strong></td>
                    <td>{{ formaterDate(loan.due_date) }}</td>
                    <td>
                      <span class="badge-mini" :class="estEnRetard(loan.due_date) ? 'badge-danger' : 'badge-ok'">
                        {{ estEnRetard(loan.due_date) ? 'En retard' : 'En cours' }}
                      </span>
                    </td>
                    <td>
                      <RouterLink
                        :to="`/admin/loans/return?loan_id=${loan.id}`"
                        class="btn-table"
                      >
                        Enregistrer retour
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="tabs-header mt-4">
              <h2>Réservations en attente ({{ reservations.length }})</h2>
            </div>

            <div v-if="reservations.length === 0" class="empty-sub">
              Aucune réservation en attente.
            </div>

            <div v-else class="table-wrapper">
              <table class="mini-table">
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Date demande</th>
                    <th>Position</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="res in reservations" :key="res.id">
                    <td>{{ res.book?.title }}</td>
                    <td>{{ formaterDate(res.reserved_at) }}</td>
                    <td>Rang {{ res.position }}</td>
                    <td>
                      <span class="badge-mini badge-warning">
                        {{ res.status }}
                      </span>
                    </td>
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
import { useRoute } from 'vue-router'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import { membersService } from '@/services/membersService'
import { formaterDate, estEnRetard } from '@/utils/dates'

const route = useRoute()
const loading = ref(true)
const member = ref(null)
const activeLoans = ref([])
const reservations = ref([])

async function loadMemberData() {
  loading.value = true
  try {
    const memberId = route.params.id
    const [mRes, loansRes, resRes] = await Promise.all([
      membersService.getById(memberId),
      membersService.getLoans(memberId),
      membersService.getReservations(memberId)
    ])

    member.value = mRes.data
    activeLoans.value = (loansRes.data || []).filter((l) => l.status === 'active' || l.status === 'overdue')
    reservations.value = (resRes.data || []).filter((r) => r.status === 'pending' || r.status === 'ready')
  } catch (err) {
    console.error('Erreur chargement adhérent', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMemberData()
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
  max-width: 1200px;
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

.member-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 2rem;
  align-items: start;
}

.panel-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.member-profile-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.8rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid #f1f5f9;
}

.avatar-circle {
  width: 54px;
  height: 54px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.info-row .label {
  color: #64748b;
  font-weight: 600;
}

.info-row .val {
  color: #0f172a;
  font-weight: 500;
}

.tabs-header h2 {
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.mt-4 { margin-top: 2rem; }

.mini-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.mini-table th {
  padding: 0.6rem 0.8rem;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.mini-table td {
  padding: 0.8rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.badge-mini {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.badge-ok { background: #dcfce7; color: #15803d; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-warning { background: #fef3c7; color: #b45309; }

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.3rem;
}

.status-active { background: #dcfce7; color: #15803d; }
.status-inactive { background: #fee2e2; color: #b91c1c; }

.btn-table {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  text-decoration: none;
  font-weight: 600;
}

.btn-table:hover { background: #e2e8f0; }

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

.loading-box, .empty-sub {
  padding: 2rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
}
</style>
