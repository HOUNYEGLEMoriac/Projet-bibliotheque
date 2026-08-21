<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Enregistrer un Retour de Livre</h1>
            <p>Clôture du prêt, vérification de l'état de l'exemplaire et remise en circulation.</p>
          </div>
          <RouterLink to="/admin/loans" class="btn btn-secondary">
            ← Liste des emprunts
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
          <form @submit.prevent="submitReturn" class="admin-form">

            <div class="form-group">
              <label for="loan_id">Sélectionner l'emprunt à clôturer *</label>
              <select id="loan_id" v-model="selectedLoanId" @change="onLoanSelect" required>
                <option value="" disabled>Choisir un emprunt actif...</option>
                <option v-for="loan in activeLoans" :key="loan.id" :value="loan.id">
                  {{ loan.book_copy?.book?.title }} (Réf: {{ loan.book_copy?.reference }}) — {{ loan.member?.first_name }} {{ loan.member?.last_name }}
                </option>
              </select>
            </div>

            <!-- Récapitulatif de l'emprunt sélectionné -->
            <div v-if="selectedLoan" class="selected-loan-summary">
              <h3>Détails du prêt</h3>
              <div class="summary-grid">
                <div>
                  <span class="lbl">Titre :</span>
                  <strong>{{ selectedLoan.book_copy?.book?.title }}</strong>
                </div>
                <div>
                  <span class="lbl">Emprunteur :</span>
                  <strong>{{ selectedLoan.member?.first_name }} {{ selectedLoan.member?.last_name }}</strong>
                </div>
                <div>
                  <span class="lbl">Date d'emprunt :</span>
                  <span>{{ formaterDate(selectedLoan.loaned_at) }}</span>
                </div>
                <div>
                  <span class="lbl">Date limite prévue :</span>
                  <span :class="{ 'text-danger font-bold': estEnRetard(selectedLoan.due_date) }">
                    {{ formaterDate(selectedLoan.due_date) }}
                  </span>
                </div>
              </div>

              <div v-if="estEnRetard(selectedLoan.due_date)" class="late-warning">
                ⚠️ Cet ouvrage est retourné avec un retard de <strong>{{ Math.abs(joursRestants(selectedLoan.due_date)) }} jour(s)</strong>.
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="condition">État physique de l'exemplaire restitué *</label>
                <select id="condition" v-model="form.condition" required>
                  <option value="good">Bon état (normal)</option>
                  <option value="worn">Usé</option>
                  <option value="damaged">Détérioré / Abîmé</option>
                  <option value="lost">Déclaré perdu</option>
                </select>
              </div>

              <div class="form-group">
                <label for="returned_at">Date effective du retour</label>
                <input id="returned_at" v-model="form.returned_at" type="date" required />
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Remarques ou observations (optionnel)</label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                placeholder="Ex: Page déchirée constatée, reliure intacte..."
              ></textarea>
            </div>

            <div class="form-actions">
              <RouterLink to="/admin/loans" class="btn btn-secondary">Annuler</RouterLink>
              <button type="submit" class="btn btn-primary" :disabled="submitting || !selectedLoanId">
                <span v-if="!submitting">Confirmer et enregistrer le retour</span>
                <span v-else>Traitement...</span>
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
import { useRoute, useRouter } from 'vue-router'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Alerte from '@/components/common/Alerte.vue'
import { loansService } from '@/services/loansService'
import api from '@/services/api'
import { formaterDate, estEnRetard, joursRestants } from '@/utils/dates'

const route = useRoute()
const router = useRouter()

const activeLoans = ref([])
const selectedLoanId = ref(route.query.loan_id || '')
const selectedLoan = ref(null)
const submitting = ref(false)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

const form = reactive({
  condition: 'good',
  returned_at: new Date().toISOString().split('T')[0],
  notes: ''
})

async function fetchActiveLoans() {
  try {
    const res = await loansService.getAll({ status: 'active', limit: 100 })
    activeLoans.value = res.data || []
    if (selectedLoanId.value) {
      onLoanSelect()
    }
  } catch (err) {
    console.error('Erreur chargement des emprunts actifs', err)
  }
}

function onLoanSelect() {
  selectedLoan.value = activeLoans.value.find((l) => l.id === selectedLoanId.value) || null
}

async function submitReturn() {
  submitting.value = true
  actionAlert.message = ''

  try {
    // Clôture de l'emprunt et enregistrement du retour
    const payload = {
      loan_id: selectedLoanId.value,
      condition: form.condition,
      returned_at: form.returned_at,
      notes: form.notes
    }

    const res = await api.post('/returns', payload)
    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Retour enregistré avec succès ! L’exemplaire est remis en stock.'
      setTimeout(() => {
        router.push('/admin/loans')
      }, 1500)
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de l'enregistrement du retour."
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchActiveLoans()
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
  max-width: 800px;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.4rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
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

.selected-loan-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.selected-loan-summary h3 {
  font-size: 0.95rem;
  color: #0f172a;
  margin-bottom: 0.8rem;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  font-size: 0.88rem;
}

.summary-grid .lbl {
  color: #64748b;
  margin-right: 0.4rem;
}

.late-warning {
  margin-top: 0.8rem;
  padding: 0.6rem 0.8rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.85rem;
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
  height: 42px;
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
}
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn-secondary:hover { background: #f8fafc; }

.text-danger { color: #dc2626; }
.font-bold { font-weight: 700; }

:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
