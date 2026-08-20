<template>
  <div class="home">

    <!-- ── HERO ─────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-content">
        <h1>Bienvenue à la bibliothèque communautaire</h1>
        <p>
          Découvrez des milliers de livres, empruntez en ligne
          et gérez vos réservations facilement.
        </p>
        <div class="hero-actions">
          <RouterLink to="/catalogue" class="btn btn-primary">
            Parcourir le catalogue
          </RouterLink>
          <RouterLink
            v-if="!authStore.isLoggedIn"
            to="/register"
            class="btn btn-outline"
          >
            Créer un compte
          </RouterLink>
          <RouterLink
            v-else
            to="/member/dashboard"
            class="btn btn-outline"
          >
            Mon espace
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── CHIFFRES ──────────────────────────────────────── -->
    <section class="stats">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-number">{{ stats.totalBooks }}</span>
          <span class="stat-label">Livres disponibles</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.totalMembers }}</span>
          <span class="stat-label">Membres inscrits</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.totalLoans }}</span>
          <span class="stat-label">Emprunts réalisés</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.totalCategories }}</span>
          <span class="stat-label">Catégories</span>
        </div>
      </div>
    </section>

    <!-- ── LIVRES RÉCENTS ────────────────────────────────── -->
    <section class="section">
      <div class="section-container">
        <div class="section-header">
          <h2>Nouveautés</h2>
          <RouterLink to="/catalogue" class="see-all">
            Voir tout
          </RouterLink>
        </div>

        <div v-if="loadingBooks" class="loading-wrapper">
          <Chargement message="Chargement des livres..." />
        </div>

        <div v-else-if="recentBooks.length === 0" class="empty">
          Aucun livre pour le moment.
        </div>

        <div v-else class="books-grid">
          <BookCard
            v-for="book in recentBooks"
            :key="book.id"
            :book="book"
          />
        </div>
      </div>
    </section>

    <!-- ── CATEGORIES ────────────────────────────────────── -->
    <section class="section section-grey">
      <div class="section-container">
        <div class="section-header">
          <h2>Parcourir par catégorie</h2>
        </div>

        <div v-if="loadingCategories" class="loading-wrapper">
          <Chargement message="Chargement..." />
        </div>

        <div v-else class="categories-grid">
          <RouterLink
            v-for="category in categories"
            :key="category.id"
            :to="`/catalogue?category=${category.id}`"
            class="category-card"
          >
            <span class="category-name">{{ category.name }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── COMMENT CA MARCHE ─────────────────────────────── -->
    <section class="section">
      <div class="section-container">
        <div class="section-header">
          <h2>Comment ça marche ?</h2>
        </div>

        <div class="steps-grid">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Inscrivez-vous</h3>
            <p>Créez votre compte gratuitement en quelques secondes.</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Choisissez un livre</h3>
            <p>Parcourez le catalogue et trouvez votre prochain livre.</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Empruntez</h3>
            <p>Empruntez jusqu'à 3 livres simultanément.</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Retournez</h3>
            <p>Retournez le livre dans les délais et évitez les pénalités.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA FINAL ─────────────────────────────────────── -->
    <section v-if="!authStore.isLoggedIn" class="cta">
      <div class="cta-content">
        <h2>Rejoignez la communauté</h2>
        <p>Inscription gratuite, accès immédiat à tout le catalogue.</p>
        <RouterLink to="/register" class="btn btn-primary btn-large">
          Créer mon compte
        </RouterLink>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { booksService } from '@/services/booksService'
import BookCard from '@/components/books/BookCard.vue'
import Chargement from '@/components/common/Chargement.vue'

const authStore = useAuthStore()

const recentBooks = ref([])
const categories = ref([])
const loadingBooks = ref(false)
const loadingCategories = ref(false)

const stats = ref({
  totalBooks: '...',
  totalMembers: '...',
  totalLoans: '...',
  totalCategories: '...'
})

async function fetchRecentBooks() {
  loadingBooks.value = true
  try {
    const res = await booksService.getAll({ limit: 8, sort: 'created_at' })
    recentBooks.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loadingBooks.value = false
  }
}

async function fetchCategories() {
  loadingCategories.value = true
  try {
    const res = await booksService.getCategories()
    categories.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loadingCategories.value = false
  }
}

async function fetchStats() {
  try {
    const res = await booksService.getStats()
    stats.value = res.data
  } catch (err) {
    // Si le backend n'a pas encore cette route, on affiche rien
    stats.value = {
      totalBooks: '-',
      totalMembers: '-',
      totalLoans: '-',
      totalCategories: '-'
    }
  }
}

onMounted(() => {
  fetchRecentBooks()
  fetchCategories()
  fetchStats()
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

/* ── HERO ──────────────────────────────────────────────── */
.hero {
  background: linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%);
  color: white;
  padding: 5rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.hero-content p {
  font-size: 1.15rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.7rem 1.6rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #e53935;
  color: white;
}

.btn-primary:hover {
  background: #c62828;
}

.btn-outline {
  border: 2px solid white;
  color: white;
  background: transparent;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-large {
  padding: 0.9rem 2.5rem;
  font-size: 1rem;
}

/* ── STATS ─────────────────────────────────────────────── */
.stats {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a237e;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

/* ── SECTIONS ──────────────────────────────────────────── */
.section {
  padding: 4rem 2rem;
}

.section-grey {
  background: #f5f7fb;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.6rem;
  color: #1a237e;
  font-weight: 700;
}

.see-all {
  color: #1a237e;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid #1a237e;
  padding-bottom: 1px;
}

/* ── BOOKS GRID ────────────────────────────────────────── */
.books-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

/* ── CATEGORIES ────────────────────────────────────────── */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.category-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.2rem;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.category-card:hover {
  border-color: #1a237e;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.12);
  transform: translateY(-2px);
}

.category-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

/* ── STEPS ─────────────────────────────────────────────── */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.step {
  text-align: center;
  padding: 1.5rem;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #1a237e;
  color: white;
  border-radius: 50%;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.step h3 {
  font-size: 1.1rem;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.step p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ── CTA ───────────────────────────────────────────────── */
.cta {
  background: #1a237e;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.cta-content {
  max-width: 500px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
}

.cta-content p {
  opacity: 0.85;
  margin-bottom: 1.5rem;
}

/* ── LOADING / EMPTY ───────────────────────────────────── */
.loading-wrapper {
  padding: 2rem 0;
}

.empty {
  text-align: center;
  padding: 3rem;
  color: #999;
}
</style>
