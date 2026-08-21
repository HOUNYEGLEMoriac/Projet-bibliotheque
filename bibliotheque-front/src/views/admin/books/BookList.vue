<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── EN-TÊTE ──────────────────────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Gestion du Catalogue de Livres</h1>
            <p>{{ totalBooks }} ouvrage(s) répertorié(s) dans la base.</p>
          </div>
          <RouterLink to="/admin/books/add" class="btn btn-primary">
            + Ajouter un nouveau livre
          </RouterLink>
        </div>

        <!-- Alerte de statut -->
        <Alerte
          v-if="actionAlert.message"
          :message="actionAlert.message"
          :type="actionAlert.type"
          :duree="4000"
          @fermer="actionAlert.message = ''"
        />

        <!-- ── SECTION PRINCIPALE ────────────────────────────── -->
        <div class="panel-card">

          <!-- Barre d'outils (Recherche & Filtres) -->
          <div class="table-toolbar">
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par titre, auteur ou ISBN..."
                class="search-input"
                @input="handleFilterChange"
              />
            </div>

            <div class="filters-group">
              <select v-model="selectedCategory" @change="handleFilterChange" class="filter-select">
                <option value="">Toutes les catégories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>

              <select v-model="selectedAvailability" @change="handleFilterChange" class="filter-select">
                <option value="">Tous les états</option>
                <option value="available">Disponibles uniquement</option>
                <option value="unavailable">Épuisés / Empruntés</option>
              </select>
            </div>
          </div>

          <!-- Chargement -->
          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement des livres..." />
          </div>

          <!-- État vide -->
          <div v-else-if="books.length === 0" class="empty-box">
            <p>Aucun livre ne correspond aux critères de recherche.</p>
          </div>

          <!-- Tableau des livres -->
          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Couverture</th>
                  <th>Titre & Auteur</th>
                  <th>ISBN</th>
                  <th>Catégorie</th>
                  <th>Exemplaires (Dispo / Total)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in books" :key="book.id">

                  <!-- Couverture miniature -->
                  <td class="col-cover">
                    <img
                      v-if="book.cover_url"
                      :src="book.cover_url"
                      :alt="book.title"
                      class="book-mini-cover"
                    />
                    <div v-else class="cover-placeholder-mini">
                      {{ book.title[0] }}
                    </div>
                  </td>

                  <!-- Titre et Auteur -->
                  <td>
                    <div class="font-bold text-dark">{{ book.title }}</div>
                    <div class="text-muted text-sm">{{ book.author }}</div>
                  </td>

                  <!-- ISBN -->
                  <td>
                    <code class="ref-code">{{ book.isbn || 'Non renseigné' }}</code>
                  </td>

                  <!-- Catégorie -->
                  <td>
                    <span class="category-badge">
                      {{ book.category?.name || 'Général' }}
                    </span>
                  </td>

                  <!-- Exemplaires -->
                  <td>
                    <span
                      class="stock-pill"
                      :class="book.available_copies > 0 ? 'stock-ok' : 'stock-empty'"
                    >
                      {{ book.available_copies }} / {{ book.total_copies }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td>
                    <div class="actions-cell">
                      <RouterLink
                        :to="`/catalogue/${book.id}`"
                        class="btn-icon"
                        title="Voir la fiche publique"
                        target="_blank"
                      >
                        👁
                      </RouterLink>
                      <RouterLink
                        :to="`/admin/books/edit/${book.id}`"
                        class="btn-icon btn-edit"
                        title="Modifier l'ouvrage"
                      >
                        ✏️
                      </RouterLink>
                      <button
                        class="btn-icon btn-delete"
                        title="Supprimer"
                        @click="handleDelete(book)"
                      >
                        🗑
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
import { ref, onMounted, reactive } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'
import { booksService } from '@/services/booksService'

const loading = ref(true)
const books = ref([])
const categories = ref([])

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedAvailability = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const totalBooks = ref(0)
const limit = 10

const actionAlert = reactive({
  message: '',
  type: 'info'
})

async function fetchCategories() {
  try {
    const res = await booksService.getCategories()
    categories.value = res.data || []
  } catch (err) {
    console.error('Erreur chargement catégories', err)
  }
}

async function fetchBooks() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit,
      search: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      available: selectedAvailability.value === 'available' ? true : selectedAvailability.value === 'unavailable' ? false : undefined
    }

    const res = await booksService.getAll(params)
    books.value = res.data || []
    totalBooks.value = res.pagination?.total || books.value.length
    totalPages.value = res.pagination?.totalPages || 1
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de récupérer la liste des livres.'
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  currentPage.value = 1
  fetchBooks()
}

function changePage(page) {
  currentPage.value = page
  fetchBooks()
}

async function handleDelete(book) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${book.title}" ?`)) return

  try {
    const res = await booksService.remove(book.id)
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Livre supprimé avec succès.'
      fetchBooks()
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors de la suppression du livre.'
  }
}

onMounted(() => {
  fetchCategories()
  fetchBooks()
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

/* ── PANEL ─────────────────────────────────────────────── */
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

.filters-group {
  display: flex;
  gap: 0.8rem;
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

/* ── DATA TABLE ────────────────────────────────────────── */
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

.col-cover {
  width: 60px;
}

.book-mini-cover {
  width: 42px;
  height: 58px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
}

.cover-placeholder-mini {
  width: 42px;
  height: 58px;
  background: #2563eb;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.font-bold { font-weight: 700; }
.text-dark { color: #0f172a; }
.text-muted { color: #64748b; }
.text-sm { font-size: 0.82rem; }

.ref-code {
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #334155;
}

.category-badge {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
}

.stock-pill {
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

.stock-ok { background: #dcfce7; color: #15803d; }
.stock-empty { background: #fee2e2; color: #b91c1c; }

/* ── ACTIONS CELL ───────────────────────────────────────── */
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

.btn-delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* ── PAGINATION ─────────────────────────────────────────── */
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

/* ── BOUTONS ────────────────────────────────────────────── */
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
