<template>
  <div class="catalogue-page">

    <!-- ── EN-TÊTE ───────────────────────────────────────── -->
    <div class="page-header">
      <div class="page-header-content">
        <h1>Catalogue</h1>
        <p>{{ totalBooks }} livre(s) disponible(s)</p>
      </div>
    </div>

    <div class="catalogue-layout">

      <!-- ── SIDEBAR FILTRES ───────────────────────────────── -->
      <aside class="sidebar">
        <div class="sidebar-block">
          <h3>Recherche</h3>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Titre, auteur, ISBN..."
            class="search-input"
            @input="onFilterChange"
          />
        </div>

        <div class="sidebar-block">
          <h3>Catégorie</h3>
          <ul class="filter-list">
            <li>
              <button
                :class="['filter-btn', !filters.category ? 'active' : '']"
                @click="setCategory(null)"
              >
                Toutes les catégories
              </button>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <button
                :class="['filter-btn', filters.category === cat.id ? 'active' : '']"
                @click="setCategory(cat.id)"
              >
                {{ cat.name }}
              </button>
            </li>
          </ul>
        </div>

        <div class="sidebar-block">
          <h3>Disponibilité</h3>
          <ul class="filter-list">
            <li>
              <button
                :class="['filter-btn', filters.availability === null ? 'active' : '']"
                @click="setAvailability(null)"
              >
                Tous
              </button>
            </li>
            <li>
              <button
                :class="['filter-btn', filters.availability === true ? 'active' : '']"
                @click="setAvailability(true)"
              >
                Disponibles uniquement
              </button>
            </li>
          </ul>
        </div>

        <div class="sidebar-block">
          <h3>Trier par</h3>
          <select v-model="filters.sort" class="select-input" @change="onFilterChange">
            <option value="created_at">Plus récents</option>
            <option value="title">Titre A-Z</option>
            <option value="author">Auteur A-Z</option>
          </select>
        </div>

        <button class="btn-reset" @click="resetFilters">
          Réinitialiser les filtres
        </button>
      </aside>

      <!-- ── CONTENU PRINCIPAL ─────────────────────────────── -->
      <main class="catalogue-main">

        <!-- Chargement -->
        <div v-if="loading" class="loading-wrapper">
          <Chargement message="Chargement du catalogue..." />
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="books.length === 0" class="empty-state">
          <p class="empty-title">Aucun livre trouvé</p>
          <p class="empty-sub">Essayez de modifier vos filtres de recherche.</p>
          <button class="btn-reset" @click="resetFilters">
            Réinitialiser
          </button>
        </div>

        <!-- Grille livres -->
        <div v-else>
          <div class="books-grid">
            <BookCard
              v-for="book in books"
              :key="book.id"
              :book="book"
            />
          </div>

          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              Précédent
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-btn', page === currentPage ? 'active' : '']"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Suivant
            </button>
          </div>
        </div>

      </main>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { booksService } from '@/services/booksService'
import BookCard from '@/components/books/BookCard.vue'
import Chargement from '@/components/common/Chargement.vue'

const route = useRoute()
const router = useRouter()

const books = ref([])
const categories = ref([])
const loading = ref(false)
const totalBooks = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const limit = 12

const filters = ref({
  search: route.query.search || '',
  category: route.query.category || null,
  availability: null,
  sort: route.query.sort || 'created_at'
})

// ── Pages visibles dans la pagination ───────────────────
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// ── Chargement des livres ────────────────────────────────
async function fetchBooks() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit,
      sort: filters.value.sort
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.category) params.category = filters.value.category
    if (filters.value.availability !== null) {
      params.available = filters.value.availability
    }

    const res = await booksService.getAll(params)
    books.value = res.data
    totalBooks.value = res.pagination?.total || 0
    totalPages.value = res.pagination?.totalPages || 1
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ── Chargement des catégories ────────────────────────────
async function fetchCategories() {
  try {
    const res = await booksService.getCategories()
    categories.value = res.data
  } catch (err) {
    console.error(err)
  }
}

// ── Actions filtres ──────────────────────────────────────
function onFilterChange() {
  currentPage.value = 1
  updateQueryParams()
  fetchBooks()
}

function setCategory(id) {
  filters.value.category = id
  onFilterChange()
}

function setAvailability(value) {
  filters.value.availability = value
  onFilterChange()
}

function resetFilters() {
  filters.value = {
    search: '',
    category: null,
    availability: null,
    sort: 'created_at'
  }
  currentPage.value = 1
  updateQueryParams()
  fetchBooks()
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Sync avec l'URL ──────────────────────────────────────
function updateQueryParams() {
  const query = {}
  if (filters.value.search) query.search = filters.value.search
  if (filters.value.category) query.category = filters.value.category
  if (filters.value.sort !== 'created_at') query.sort = filters.value.sort
  router.replace({ query })
}

// ── Watcher sur l'URL (si on arrive depuis Home avec ?category=) ──
watch(
  () => route.query.category,
  (newCat) => {
    if (newCat && newCat !== filters.value.category) {
      filters.value.category = newCat
      fetchBooks()
    }
  }
)

onMounted(() => {
  fetchCategories()
  fetchBooks()
})
</script>

<style scoped>
.catalogue-page {
  min-height: calc(100vh - 140px);
  background: #f5f7fb;
}

/* ── EN-TÊTE ────────────────────────────────────────────── */
.page-header {
  background: #1a237e;
  color: white;
  padding: 2.5rem 2rem;
}

.page-header-content {
  max-width: 1300px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.page-header p {
  opacity: 0.8;
  font-size: 0.95rem;
}

/* ── LAYOUT ─────────────────────────────────────────────── */
.catalogue-layout {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: start;
}

/* ── SIDEBAR ────────────────────────────────────────────── */
.sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  position: sticky;
  top: 85px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-block h3 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin-bottom: 0.8rem;
}

.search-input,
.select-input {
  width: 100%;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 0.8rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.search-input:focus,
.select-input:focus {
  border-color: #1a237e;
}

.filter-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.filter-btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #444;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f0f4ff;
  color: #1a237e;
}

.filter-btn.active {
  background: #e8eaf6;
  color: #1a237e;
  font-weight: 600;
}

.btn-reset {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  border-color: #1a237e;
  color: #1a237e;
}

/* ── GRILLE ─────────────────────────────────────────────── */
.catalogue-main {
  min-height: 400px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* ── PAGINATION ─────────────────────────────────────────── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 0.8rem;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #1a237e;
  color: #1a237e;
}

.page-btn.active {
  background: #1a237e;
  color: white;
  border-color: #1a237e;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── EMPTY ──────────────────────────────────────────────── */
.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-sub {
  color: #888;
  margin-bottom: 1.5rem;
}
</style>
