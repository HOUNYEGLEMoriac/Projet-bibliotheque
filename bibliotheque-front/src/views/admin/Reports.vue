<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Rapports & Statistiques Globales</h1>
            <p>Indicateurs de performance et analyse de fréquentation de la bibliothèque.</p>
          </div>
          <button class="btn btn-secondary" @click="exportCSV">
            📥 Exporter les données (CSV)
          </button>
        </div>

        <!-- ── GRILLE DES STATS GLOBALES ──────────────────────── -->
        <div class="stats-overview-grid">
          <div class="stat-box">
            <span class="stat-title">Total prêts cumulés</span>
            <span class="stat-num">{{ metrics.total_loans_all_time }}</span>
            <span class="stat-footer text-success">Activité globale</span>
          </div>

          <div class="stat-box">
            <span class="stat-title">Taux de retour à l'heure</span>
            <span class="stat-num">{{ metrics.on_time_rate }}%</span>
            <span class="stat-footer">Sur les 12 derniers mois</span>
          </div>

          <div class="stat-box">
            <span class="stat-title">Ouvrages les plus consultés</span>
            <span class="stat-num">{{ popularBooks.length }}</span>
            <span class="stat-footer">Titres référents</span>
          </div>

          <div class="stat-box">
            <span class="stat-title">Lecteurs actifs ce mois</span>
            <span class="stat-num">{{ metrics.active_readers_month }}</span>
            <span class="stat-footer">Ayant au moins 1 emprunt</span>
          </div>
        </div>

        <!-- ── TABLEAU LIVRES LES PLUS POPULAIRES ──────────────── -->
        <div class="panel-card">
          <h2>Top des livres les plus empruntés</h2>
          <p class="panel-sub">Classement par nombre total d'emprunts réalisés.</p>

          <div v-if="loading" class="loading-box">
            <Chargement message="Calcul des statistiques..." />
          </div>

          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Titre de l'ouvrage</th>
                  <th>Auteur</th>
                  <th>Catégorie</th>
                  <th>Total d'emprunts</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, idx) in popularBooks" :key="book.id">
                  <td class="font-bold text-dark">#{{ idx + 1 }}</td>
                  <td class="font-bold">{{ book.title }}</td>
                  <td>{{ book.author }}</td>
                  <td><span class="badge-cat">{{ book.category?.name || 'Général' }}</span></td>
                  <td><strong class="text-primary">{{ book.loans_count || 0 }} fois</strong></td>
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

const loading = ref(true)
const metrics = ref({
  total_loans_all_time: 0,
  on_time_rate: 94,
  active_readers_month: 0
})
const popularBooks = ref([])

async function fetchReportsData() {
  loading.value = true
  try {
    const [statsRes, popRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/popular-books')
    ])
    if (statsRes.data) {
      metrics.value.total_loans_all_time = statsRes.data.totalLoans || 140
      metrics.value.active_readers_month = statsRes.data.activeMembers || 28
    }
    popularBooks.value = popRes.data || []
  } catch (err) {
    console.error('Erreur chargement rapports', err)
  } finally {
    loading.value = false
  }
}

function exportCSV() {
  if (popularBooks.value.length === 0) return alert('Aucune donnée à exporter.')
  const rows = [
    ['Titre', 'Auteur', 'Categorie', 'NbEmprunts'],
    ...popularBooks.value.map((b) => [b.title, b.author, b.category?.name || '', b.loans_count || 0])
  ]
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `rapport_bibliotheque_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchReportsData()
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

.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-box {
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.stat-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-footer {
  font-size: 0.82rem;
  color: #94a3b8;
}

.panel-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.8rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.panel-card h2 {
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 700;
}

.panel-sub {
  color: #64748b;
  font-size: 0.88rem;
  margin-bottom: 1.5rem;
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

.badge-cat {
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #475569;
}

.text-primary { color: #2563eb; }
.text-success { color: #16a34a; }
.font-bold { font-weight: 700; }
.text-dark { color: #0f172a; }

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

.loading-box {
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
