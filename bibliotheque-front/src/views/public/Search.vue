<template>
  <div class="search-page">

    <!-- ── BARRE DE RECHERCHE PRINCIPALE ──────────────────── -->
    <div class="search-hero">
      <div class="container">
        <h1>Recherche dans le catalogue</h1>
        <p>Trouvez un ouvrage par titre, auteur, résumé ou numéro ISBN.</p>

        <form @submit.prevent="handleSearchSubmit" class="search-form">
          <div class="search-input-wrapper">
            <input
              v-model="query"
              type="text"
              class="main-search-input"
              placeholder="Ex: Victor Hugo, Les Misérables, 978-2..."
              autofocus
            />
            <button
              v-if="query"
              type="button"
              class="btn-clear"
              @click="clearSearch"
            >
              ✕
            </button>
          </div>
          <button type="submit" class="btn btn-submit" :disabled="loading">
            Rechercher
          </button>
        </form>
      </div>
    </div>

    <!-- ── ZONE DE RÉSULTATS & FILTRES RAPIDES ───────────── -->
    <div class="container main-content">

      <!-- Barre d'outils filtres (si une recherche a été effectuée) -->
      <div v-if="hasSearched" class="results-toolbar">
        <div class="results-count">
          <span v-if="!loading">
            <strong>{{ results.length }}</strong> résultat(s) pour "<em>{{ activeQuery }}</em>"
          </span>
          <span v-else>Recherche en cours...</span>
        </div>

        <div class="quick-filters">
          <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
            <option value="">Toutes les catégories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>

          <select v-model="selectedAvailability" @change="applyFilters" class="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="available">Disponibles uniquement</option>
          </select>
        </div>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="loading-wrapper">
        <Chargement message="Recherche des correspondances..." />
      </div>

      <!-- État initial (aucune recherche lancée) -->
      <div v-else-if="!hasSearched" class="placeholder-state">
        <div class="placeholder-icon">🔍</div>
        <h2>Commencez votre recherche</h2>
        <p>Saisissez un mot-clé ci-dessus pour explorer les ouvrages de la bibliothèque.</p>
      </div>

      <!-- Aucun résultat -->
      <div v-else-if="filteredResults.length === 0" class="empty-state">
        <h2>Aucun résultat trouvé</h2>
        <p>Nous n'avons trouvé aucun livre correspondant à votre requête.</p>
        <ul class="search-tips">
          <li>Vérifiez l'orthographe des termes recherchés.</li>
          <li>Essayez avec un mot-clé plus générique ou le nom de famille de l'auteur.</li>
          <li>Élargissez vos filtres de recherche.</li>
        </ul>
      </div>

      <!-- Grille des résultats -->
      <div v-else class="results-grid">
        <BookCard
          v-for="book in filteredResults"
          :key="book.id"
          :book="book"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { booksService } from '@/services/booksService'
import BookCard from '@/components/books/BookCard.vue'
import Chargement from '@/components/common/Chargement.vue'

const route = useRoute()
const router = useRouter()

const query = ref(route.query.q || '')
const activeQuery = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const results = ref([])
const categories = ref([])

const selectedCategory = ref('')
const selectedAvailability = ref('all')

// ── Filtrage côté client sur le sous-ensemble de résultats ──
const filteredResults = computed(() => {
  return results.value.filter((book) => {
    // Filtre catégorie
    if (selectedCategory.value && book.category_id !== selectedCategory.value && book.category?.id !== selectedCategory.value) {
      return false
    }
    // Filtre disponibilité
    if (selectedAvailability.value === 'available' && book.available_copies <= 0) {
      return false
    }
    return true
  })
})

async function fetchCategories() {
  try {
    const res = await booksService.getCategories()
    categories.value = res.data
  } catch (err) {
    console.error('Erreur chargement catégories', err)
  }
}

async function performSearch(text) {
  if (!text || !text.trim()) return

  loading.value = true
  hasSearched.value = true
  activeQuery.value = text.trim()

  try {
    const res = await booksService.search(text.trim())
    results.value = res.data || []
  } catch (err) {
    console.error('Erreur lors de la recherche', err)
    results.value = []
  } finally {
    loading.value = false
  }
}

function handleSearchSubmit() {
  if (!query.value.trim()) return
  router.replace({ query: { q: query.value.trim() } })
  performSearch(query.value)
}

function clearSearch() {
  query.value = ''
  results.value = []
  hasSearched.value = false
  activeQuery.value = ''
  router.replace({ query: {} })
}

function applyFilters() {
  // Les filtres sont appliqués réactivement via la computed `filteredResults`
}

onMounted(() => {
  fetchCategories()
  if (route.query.q) {
    performSearch(route.query.q)
  }
})
</script>

<style scoped>
.search-page {
  min-height: calc(100vh - 140px);
  background: #f5f7fb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── SEARCH HERO ────────────────────────────────────────── */
.search-hero {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  padding: 3.5rem 0;
  text-align: center;
}

.search-hero h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.search-hero p {
  font-size: 1rem;
  opacity: 0.85;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  max-width: 680px;
  margin: 0 auto;
  gap: 0.75rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.main-search-input {
  width: 100%;
  height: 52px;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0 2.8rem 0 1.2rem;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}

.main-search-input:focus {
  border-color: #ff5252;
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #999;
  cursor: pointer;
}

.btn-submit {
  height: 52px;
  padding: 0 1.8rem;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}

.btn-submit:hover:not(:disabled) {
  background: #c62828;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── TOOLBAR ────────────────────────────────────────────── */
.main-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.results-count {
  font-size: 1.05rem;
  color: #333;
}

.quick-filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  height: 40px;
  padding: 0 1rem;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: white;
  font-size: 0.9rem;
  color: #333;
  outline: none;
}

.filter-select:focus {
  border-color: #1a237e;
}

/* ── GRILLE RÉSULTATS ───────────────────────────────────── */
.results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

/* ── ÉTATS VIDES & CHARGEMENT ────────────────────────────── */
.loading-wrapper {
  padding: 4rem 0;
}

.placeholder-state,
.empty-state {
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 2rem auto;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.placeholder-state h2,
.empty-state h2 {
  font-size: 1.3rem;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.placeholder-state p,
.empty-state p {
  color: #666;
  font-size: 0.95rem;
}

.search-tips {
  text-align: left;
  display: inline-block;
  margin-top: 1.2rem;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.7;
}
</style>
