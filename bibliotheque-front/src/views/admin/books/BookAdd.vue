<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Ajouter un Livre au Catalogue</h1>
            <p>Renseignez les métadonnées et le nombre d'exemplaires initiaux.</p>
          </div>
          <RouterLink to="/admin/books" class="btn btn-secondary">
            ← Retour à la liste
          </RouterLink>
        </div>

        <Alerte
          v-if="actionAlert.message"
          :message="actionAlert.message"
          :type="actionAlert.type"
          :duree="5000"
          @fermer="actionAlert.message = ''"
        />

        <div class="form-container">
          <form @submit.prevent="handleSubmit" class="admin-form">

            <div class="form-grid">

              <!-- Colonne Gauche : Métadonnées générales -->
              <div class="form-col">
                <h3>Informations bibliographiques</h3>

                <div class="form-group">
                  <label for="title">Titre de l'ouvrage *</label>
                  <input
                    id="title"
                    v-model="form.title"
                    type="text"
                    required
                    placeholder="Ex: Le Petit Prince"
                  />
                </div>

                <div class="form-group">
                  <label for="author">Auteur *</label>
                  <input
                    id="author"
                    v-model="form.author"
                    type="text"
                    required
                    placeholder="Ex: Antoine de Saint-Exupéry"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="isbn">Code ISBN</label>
                    <input
                      id="isbn"
                      v-model="form.isbn"
                      type="text"
                      placeholder="978-..."
                    />
                  </div>

                  <div class="form-group">
                    <label for="category_id">Catégorie *</label>
                    <select id="category_id" v-model="form.category_id" required>
                      <option value="" disabled>Sélectionner...</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="publisher">Éditeur</label>
                    <input
                      id="publisher"
                      v-model="form.publisher"
                      type="text"
                      placeholder="Gallimard, Folio..."
                    />
                  </div>

                  <div class="form-group">
                    <label for="published_year">Année de parution</label>
                    <input
                      id="published_year"
                      v-model.number="form.published_year"
                      type="number"
                      placeholder="Ex: 1943"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="description">Résumé de l'ouvrage</label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    rows="5"
                    placeholder="Présentation du livre..."
                  ></textarea>
                </div>
              </div>

              <!-- Colonne Droite : Stock & Média -->
              <div class="form-col">
                <h3>Stock et illustration</h3>

                <div class="form-group">
                  <label for="cover_url">URL de l'image de couverture</label>
                  <input
                    id="cover_url"
                    v-model="form.cover_url"
                    type="url"
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>

                <!-- Aperçu dynamique de l'image -->
                <div class="cover-preview-wrapper">
                  <div v-if="form.cover_url" class="cover-preview">
                    <img :src="form.cover_url" alt="Aperçu couverture" />
                  </div>
                  <div v-else class="cover-preview-empty">
                    <span>Aperçu de la couverture</span>
                  </div>
                </div>

                <div class="form-group stock-field">
                  <label for="initial_copies">Nombre d'exemplaires initiaux *</label>
                  <input
                    id="initial_copies"
                    v-model.number="form.initial_copies"
                    type="number"
                    min="1"
                    max="50"
                    required
                  />
                  <span class="field-hint">
                    Des codes d'exemplaires physiques (copies) seront automatiquement créés.
                  </span>
                </div>

              </div>

            </div>

            <div class="form-actions">
              <RouterLink to="/admin/books" class="btn btn-secondary">
                Annuler
              </RouterLink>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="!submitting">Créer et référencer le livre</span>
                <span v-else>Enregistrement en cours...</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Alerte from '@/components/common/Alerte.vue'
import { booksService } from '@/services/booksService'

const router = useRouter()
const categories = ref([])
const submitting = ref(false)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

const form = reactive({
  title: '',
  author: '',
  isbn: '',
  category_id: '',
  publisher: '',
  published_year: new Date().getFullYear(),
  description: '',
  cover_url: '',
  initial_copies: 1
})

async function fetchCategories() {
  try {
    const res = await booksService.getCategories()
    categories.value = res.data || []
  } catch (err) {
    console.error('Erreur chargement catégories', err)
  }
}

async function handleSubmit() {
  actionAlert.message = ''
  submitting.value = true

  try {
    const res = await booksService.create(form)
    if (res.success) {
      router.push('/admin/books')
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de l'enregistrement du livre."
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCategories()
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
  max-width: 1100px;
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

.form-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2.5rem;
}

.form-col h3 {
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #334155;
}

input, select, textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  border-color: #2563eb;
}

.field-hint {
  font-size: 0.75rem;
  color: #64748b;
}

.cover-preview-wrapper {
  margin-bottom: 1.5rem;
}

.cover-preview {
  width: 140px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-preview-empty {
  width: 140px;
  height: 200px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn {
  height: 44px;
  padding: 0 1.5rem;
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
.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn-secondary:hover {
  background: #f8fafc;
}

:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
