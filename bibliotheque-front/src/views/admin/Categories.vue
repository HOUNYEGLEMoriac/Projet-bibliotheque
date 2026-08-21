<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <!-- ── EN-TÊTE ──────────────────────────────────────── -->
        <div class="page-header">
          <div>
            <h1>Gestion des Catégories</h1>
            <p>Organisez le classement des livres par genre et thématique.</p>
          </div>
          <button class="btn btn-primary" @click="openCreateModal">
            + Nouvelle Catégorie
          </button>
        </div>

        <!-- Alerte de notification -->
        <Alerte
          v-if="actionAlert.message"
          :message="actionAlert.message"
          :type="actionAlert.type"
          :duree="4000"
          @fermer="actionAlert.message = ''"
        />

        <div class="panel-card">

          <!-- Chargement -->
          <div v-if="loading" class="loading-box">
            <Chargement message="Chargement des catégories..." />
          </div>

          <!-- État vide -->
          <div v-else-if="categories.length === 0" class="empty-box">
            <p>Aucune catégorie créée pour le moment.</p>
          </div>

          <!-- Tableau des catégories -->
          <div v-else class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nom de la catégorie</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in categories" :key="cat.id">
                  <td class="font-bold text-dark">{{ cat.name }}</td>
                  <td class="text-muted">{{ cat.description || 'Aucune description' }}</td>
                  <td>
                    <div class="actions-cell">
                      <button
                        class="btn-icon"
                        title="Modifier"
                        @click="openEditModal(cat)"
                      >
                        ✏️
                      </button>
                      <button
                        class="btn-icon btn-delete"
                        title="Supprimer"
                        @click="handleDelete(cat)"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>

    <!-- ── MODAL CRÉATION / ÉDITION ────────────────────────── -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="saveCategory" class="modal-form">
          <div class="form-group">
            <label for="cat_name">Nom *</label>
            <input
              id="cat_name"
              v-model="form.name"
              type="text"
              required
              placeholder="Ex: Romans policiers, Sciences..."
            />
          </div>

          <div class="form-group">
            <label for="cat_desc">Description</label>
            <textarea
              id="cat_desc"
              v-model="form.description"
              rows="3"
              placeholder="Courte description thématique..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">{{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}</span>
              <span v-else>Traitement...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Chargement from '@/components/common/Chargement.vue'
import Alerte from '@/components/common/Alerte.vue'
import { categoriesService } from '@/services/categoriesService'

const loading = ref(true)
const saving = ref(false)
const categories = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

const form = reactive({
  name: '',
  description: ''
})

async function fetchCategories() {
  loading.value = true
  try {
    const res = await categoriesService.getAll()
    categories.value = res.data || []
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de charger les catégories.'
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEditing.value = false
  currentId.value = null
  form.name = ''
  form.description = ''
  showModal.value = true
}

function openEditModal(cat) {
  isEditing.value = true
  currentId.value = cat.id
  form.name = cat.name
  form.description = cat.description || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveCategory() {
  saving.value = true
  actionAlert.message = ''

  try {
    if (isEditing.value) {
      await categoriesService.update(currentId.value, form)
      actionAlert.type = 'succes'
      actionAlert.message = 'Catégorie mise à jour avec succès.'
    } else {
      await categoriesService.create(form)
      actionAlert.type = 'succes'
      actionAlert.message = 'Catégorie créée avec succès.'
    }
    closeModal()
    fetchCategories()
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de l'enregistrement."
  } finally {
    saving.value = false
  }
}

async function handleDelete(cat) {
  if (!confirm(`Supprimer définitivement la catégorie "${cat.name}" ?`)) return

  try {
    const res = await categoriesService.remove(cat.id)
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Catégorie supprimée.'
      fetchCategories()
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de supprimer cette catégorie.'
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

.panel-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.8rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

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

.font-bold { font-weight: 700; }
.text-dark { color: #0f172a; }
.text-muted { color: #64748b; }

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

/* ── MODAL ──────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1.5rem;
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  color: #0f172a;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #64748b;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #334155;
}

input, textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
}

input:focus, textarea:focus {
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1rem;
}

.btn {
  height: 40px;
  padding: 0 1.2rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
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

.loading-box, .empty-box {
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
}
</style>
