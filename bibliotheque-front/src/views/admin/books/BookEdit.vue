<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Modifier l'Ouvrage</h1>
            <p>Mettez à jour les informations et gérez le parc d'exemplaires.</p>
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

        <div v-if="loading" class="loading-box">
          <Chargement message="Chargement des données du livre..." />
        </div>

        <div v-else class="edit-layout">

          <!-- Formulaire de modification -->
          <div class="form-container">
            <form @submit.prevent="handleUpdate" class="admin-form">

              <div class="form-group">
                <label for="title">Titre de l'ouvrage *</label>
                <input id="title" v-model="form.title" type="text" required />
              </div>

              <div class="form-group">
                <label for="author">Auteur *</label>
                <input id="author" v-model="form.author" type="text" required />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="isbn">Code ISBN</label>
                  <input id="isbn" v-model="form.isbn" type="text" />
                </div>

                <div class="form-group">
                  <label for="category_id">Catégorie *</label>
                  <select id="category_id" v-model="form.category_id" required>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="publisher">Éditeur</label>
                  <input id="publisher" v-model="form.publisher" type="text" />
                </div>

                <div class="form-group">
                  <label for="published_year">Année de parution</label>
                  <input
                    id="published_year"
                    v-model.number="form.published_year"
                    type="number"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="cover_url">URL de la couverture</label>
                <input id="cover_url" v-model="form.cover_url" type="url" />
              </div>

              <div class="form-group">
                <label for="description">Résumé</label>
                <textarea id="description" v-model="form.description" rows="4"></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="!submitting">Mettre à jour les métadonnées</span>
                <span v-else>Enregistrement...</span>
              </button>
            </form>
          </div>

          <!-- Panneau des Exemplaires Physiques (BookCopies) -->
          <div class="copies-container">
            <div class="copies-header">
              <h2>Exemplaires physiques ({{ copies.length }})</h2>
            </div>

            <div v-if="copies.length === 0" class="empty-copies">
              Aucun exemplaire physique rattaché.
            </div>

            <div v-else class="copies-list">
              <div v-for="copy in copies" :key="copy.id" class="copy-item">
                <div class="copy-info">
                  <code class="copy-ref">{{ copy.reference }}</code>
                  <span class="copy-condition">État : {{ copy.condition || 'Bon' }}</span>
                </div>
                <div class="copy-status">
                  <span class="status-badge" :class="getStatusClass(copy.status)">
                    {{ copy.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'
import { booksService } from '@/services/booksService'

const route = useRoute()
const loading = ref(true)
const submitting = ref(false)
const categories = ref([])
const copies = ref([])

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
  published_year: null,
  description: '',
  cover_url: ''
})

function getStatusClass(status) {
  const map = {
    available: 'badge-success',
    borrowed: 'badge-info',
    reserved: 'badge-warning',
    damaged: 'badge-danger',
    lost: 'badge-neutral'
  }
  return map[status] || 'badge-neutral'
}

async function loadBookData() {
  loading.value = true
  try {
    const bookId = route.params.id
    const [bookRes, catRes, copiesRes] = await Promise.all([
      booksService.getById(bookId),
      booksService.getCategories(),
      booksService.getCopies(bookId)
    ])

    categories.value = catRes.data || []
    copies.value = copiesRes.data || []

    const b = bookRes.data
    form.title = b.title || ''
    form.author = b.author || ''
    form.isbn = b.isbn || ''
    form.category_id = b.category_id || b.category?.id || ''
    form.publisher = b.publisher || ''
    form.published_year = b.published_year || null
    form.description = b.description || ''
    form.cover_url = b.cover_url || ''
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de charger les données du livre.'
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  actionAlert.message = ''
  submitting.value = true

  try {
    const res = await booksService.update(route.params.id, form)
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Livre mis à jour avec succès.'
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors de la mise à jour.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadBookData()
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

.edit-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2rem;
  align-items: start;
}

.form-container, .copies-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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

.copies-header h2 {
  font-size: 1.15rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.copies-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.copy-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.copy-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.copy-ref {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.copy-condition {
  font-size: 0.78rem;
  color: #64748b;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge-success { background: #dcfce7; color: #15803d; }
.badge-info { background: #dbeafe; color: #1e40af; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-neutral { background: #f1f5f9; color: #64748b; }

.btn {
  height: 44px;
  padding: 0 1.4rem;
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
  width: 100%;
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

.loading-box, .empty-copies {
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
