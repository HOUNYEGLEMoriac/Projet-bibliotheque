<template>
  <div class="detail-page">
    <div class="container">

      <!-- Bouton Retour -->
      <div class="back-nav">
        <RouterLink to="/catalogue" class="back-link">
          ← Retour au catalogue
        </RouterLink>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="loading-wrapper">
        <Chargement message="Chargement de la fiche du livre..." />
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="error-wrapper">
        <p class="error-text">{{ error }}</p>
        <RouterLink to="/catalogue" class="btn btn-primary">
          Retourner au catalogue
        </RouterLink>
      </div>

      <!-- Contenu de la fiche -->
      <div v-else-if="book" class="book-detail-layout">

        <!-- Colonne Gauche : Couverture -->
        <div class="cover-column">
          <div class="cover-wrapper">
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              :alt="book.title"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <span>{{ book.title[0] }}</span>
            </div>
          </div>
        </div>

        <!-- Colonne Droite : Infos & Actions -->
        <div class="info-column">

          <div class="category-tag">{{ book.category?.name || 'Sans catégorie' }}</div>
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author">Par <span>{{ book.author }}</span></p>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">ISBN</span>
              <span class="meta-value">{{ book.isbn || 'Non renseigné' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Année de publication</span>
              <span class="meta-value">{{ book.published_year || 'Non renseignée' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Éditeur</span>
              <span class="meta-value">{{ book.publisher || 'Non renseigné' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Exemplaires disponibles</span>
              <span class="meta-value font-bold" :class="book.available_copies > 0 ? 'text-success' : 'text-danger'">
                {{ book.available_copies }} / {{ book.total_copies }}
              </span>
            </div>
          </div>

          <div class="description-section">
            <h2>Résumé</h2>
            <p class="book-description">
              {{ book.description || 'Aucun résumé disponible pour ce livre.' }}
            </p>
          </div>

          <!-- Alertes de retour d'actions -->
          <Alerte
            v-if="actionAlert.message"
            :message="actionAlert.message"
            :type="actionAlert.type"
            :duree="5000"
            @fermer="actionAlert.message = ''"
          />

          <!-- Zone d'action interactive -->
          <div class="action-box">

            <!-- CAS 1 : Non connecté (Guest) -->
            <div v-if="!authStore.isLoggedIn" class="guest-action">
              <p>Vous souhaitez lire ce livre ?</p>
              <div class="action-buttons">
                <RouterLink to="/login" class="btn btn-primary">Se connecter</RouterLink>
                <RouterLink to="/register" class="btn btn-outline">S'inscrire</RouterLink>
              </div>
            </div>

            <!-- CAS 2 : Connecté comme Admin -->
            <div v-else-if="authStore.isAdmin" class="admin-action">
              <p class="info-role">Rôle : Administrateur</p>
              <RouterLink :to="`/admin/books/edit/${book.id}`" class="btn btn-admin">
                Modifier la fiche du livre
              </RouterLink>
            </div>

            <!-- CAS 3 : Connecté comme Membre -->
            <div v-else class="member-action">

              <!-- 3.1 : Livre Disponible → Action Emprunt -->
              <div v-if="book.available_copies > 0">
                <p class="status-msg text-success">
                  Ce livre est actuellement disponible dans nos rayons.
                </p>
                <button
                  class="btn btn-primary w-full"
                  :disabled="actionLoading"
                  @click="borrowBook"
                >
                  <span v-if="!actionLoading">Emprunter ce livre (15 jours)</span>
                  <span v-else>Traitement en cours...</span>
                </button>
              </div>

              <!-- 3.2 : Livre Indisponible → Action Réservation -->
              <div v-else>
                <p class="status-msg text-danger">
                  Tous les exemplaires sont actuellement empruntés.
                </p>
                <button
                  class="btn btn-warning w-full"
                  :disabled="actionLoading"
                  @click="reserveBook"
                >
                  <span v-if="!actionLoading">Réserver (se mettre sur liste d'attente)</span>
                  <span v-else>Traitement en cours...</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { booksService } from '@/services/booksService'
import { loansService } from '@/services/loansService'
import { reservationsService } from '@/services/reservationsService'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'

const route = useRoute()
const authStore = useAuthStore()

const book = ref(null)
const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

async function fetchBookDetail() {
  loading.value = true
  error.value = null
  try {
    const res = await booksService.getById(route.params.id)
    book.value = res.data
  } catch (err) {
    error.value = err.message || "Impossible de charger la fiche de ce livre."
  } finally {
    loading.value = false
  }
}

async function borrowBook() {
  actionLoading.value = true
  actionAlert.message = ''
  try {
    // Le backend associe le membre connecté au livre via son ID
    const res = await loansService.create({ book_id: book.value.id })
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Emprunt enregistré avec succès ! Vous pouvez passer le récupérer au guichet.'
      // Actualiser l'état du livre localement (disponibilité)
      book.value.available_copies--
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de la demande d'emprunt."
  } finally {
    actionLoading.value = false
  }
}

async function reserveBook() {
  actionLoading.value = true
  actionAlert.message = ''
  try {
    const res = await reservationsService.create({ book_id: book.value.id })
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Réservation validée. Vous serez notifié dès qu’un exemplaire se libérera.'
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de la réservation."
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  fetchBookDetail()
})
</script>

<style scoped>
.detail-page {
  min-height: calc(100vh - 140px);
  background: #f5f7fb;
  padding: 2rem 0;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.back-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  color: #1a237e;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0d1252;
}

/* ── LAYOUT ─────────────────────────────────────────────── */
.book-detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 3rem;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

/* ── COUVERTURE ─────────────────────────────────────────── */
.cover-column {
  display: flex;
  flex-direction: column;
}

.cover-wrapper {
  width: 100%;
  height: 450px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  background: #f5f5f5;
  border: 1px solid #eaeaea;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  font-weight: 700;
  color: white;
}

/* ── INFOS ──────────────────────────────────────────────── */
.info-column {
  display: flex;
  flex-direction: column;
}

.category-tag {
  align-self: flex-start;
  background: #e8eaf6;
  color: #1a237e;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.book-title {
  font-size: 2.2rem;
  color: #1a237e;
  font-weight: 800;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.book-author {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.book-author span {
  font-weight: 600;
  color: #333;
}

/* ── METADONNEES GRID ───────────────────────────────────── */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-success { color: #2e7d32; }
.text-danger { color: #c62828; }

/* ── DESCRIPTION ────────────────────────────────────────── */
.description-section {
  margin-bottom: 2.5rem;
}

.description-section h2 {
  font-size: 1.2rem;
  color: #1a237e;
  margin-bottom: 0.8rem;
  font-weight: 700;
}

.book-description {
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-line;
}

/* ── ZONE D'ACTIONS ──────────────────────────────────────── */
.action-box {
  background: #f0f4ff;
  border: 1px solid #d0daf5;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: auto;
}

.guest-action p {
  color: #333;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.status-msg {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  text-align: center;
}

.info-role {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.8rem;
}

/* ── BOUTONS ────────────────────────────────────────────── */
.btn {
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-primary {
  background: #1a237e;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: #11195f;
}

.btn-outline {
  border: 1.5px solid #1a237e;
  color: #1a237e;
  background: transparent;
}
.btn-outline:hover {
  background: rgba(26, 35, 126, 0.05);
}

.btn-warning {
  background: #f57c00;
  color: white;
}
.btn-warning:hover:not(:disabled) {
  background: #e65100;
}

.btn-admin {
  background: #37474f;
  color: white;
}
.btn-admin:hover {
  background: #263238;
}

.w-full {
  width: 100%;
}

:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── AUTRES ─────────────────────────────────────────────── */
.loading-wrapper,
.error-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.error-text {
  color: #c62828;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
</style>
