<template>
  <div class="member-space">
    <div class="container">

      <!-- ── EN-TÊTE ──────────────────────────────────────── -->
      <div class="member-header">
        <div class="welcome-text">
          <h1>Mon Profil</h1>
          <p>Gérez vos coordonnées personnelles et vos identifiants de connexion.</p>
        </div>
      </div>

      <!-- ── NAVIGATION ONGLETS ────────────────────────────── -->
      <nav class="member-tabs">
        <RouterLink to="/member/dashboard" class="tab-item">
          Vue d'ensemble
        </RouterLink>
        <RouterLink to="/member/loans" class="tab-item">
          Mes emprunts
        </RouterLink>
        <RouterLink to="/member/reservations" class="tab-item">
          Mes réservations
        </RouterLink>
        <RouterLink to="/member/history" class="tab-item">
          Historique
        </RouterLink>
        <RouterLink to="/member/notifications" class="tab-item">
          Notifications
        </RouterLink>
        <RouterLink to="/member/profile" class="tab-item active">
          Mon profil
        </RouterLink>
      </nav>

      <!-- Alertes de statut -->
      <Alerte
        v-if="actionAlert.message"
        :message="actionAlert.message"
        :type="actionAlert.type"
        :duree="5000"
        @fermer="actionAlert.message = ''"
      />

      <div class="profile-grid">

        <!-- ── SECTION 1 : INFORMATIONS PERSONNELLES ─────────── -->
        <div class="section-card">
          <div class="card-header">
            <h2>Informations personnelles</h2>
            <p>Mettez à jour vos coordonnées de contact pour les relances.</p>
          </div>

          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label for="first_name">Prénom</label>
                <input
                  id="first_name"
                  v-model="profileForm.first_name"
                  type="text"
                  required
                />
              </div>

              <div class="form-group">
                <label for="last_name">Nom</label>
                <input
                  id="last_name"
                  v-model="profileForm.last_name"
                  type="text"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Adresse email (identifiant)</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                disabled
                class="input-disabled"
              />
              <span class="field-hint">L'adresse email ne peut pas être modifiée directement.</span>
            </div>

            <div class="form-group">
              <label for="phone">Numéro de téléphone</label>
              <input
                id="phone"
                v-model="profileForm.phone"
                type="tel"
                placeholder="Ex: 06 12 34 56 78"
              />
            </div>

            <div class="form-group">
              <label for="address">Adresse postale</label>
              <textarea
                id="address"
                v-model="profileForm.address"
                rows="3"
                placeholder="Numéro, rue, code postal, ville"
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
              <span v-if="!savingProfile">Enregistrer les modifications</span>
              <span v-else>Enregistrement...</span>
            </button>
          </form>
        </div>

        <!-- ── SECTION 2 : SÉCURITÉ / MOT DE PASSE ──────────── -->
        <div class="section-card">
          <div class="card-header">
            <h2>Sécurité du compte</h2>
            <p>Modifiez votre mot de passe d'accès.</p>
          </div>

          <form @submit.prevent="updatePassword" class="profile-form">
            <div class="form-group">
              <label for="current_password">Mot de passe actuel</label>
              <input
                id="current_password"
                v-model="passwordForm.currentPassword"
                type="password"
                required
              />
            </div>

            <div class="form-group">
              <label for="new_password">Nouveau mot de passe</label>
              <input
                id="new_password"
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="8"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div class="form-group">
              <label for="confirm_password">Confirmer le nouveau mot de passe</label>
              <input
                id="confirm_password"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="8"
              />
            </div>

            <button type="submit" class="btn btn-outline-primary" :disabled="savingPassword">
              <span v-if="!savingPassword">Mettre à jour le mot de passe</span>
              <span v-else>Mise à jour...</span>
            </button>
          </form>

          <!-- Récapitulatif du compte -->
          <div class="account-summary">
            <h3>Détails de l'adhésion</h3>
            <div class="summary-item">
              <span>Statut du compte :</span>
              <span class="badge-active">Actif</span>
            </div>
            <div class="summary-item">
              <span>Quota maximal d'emprunts :</span>
              <strong>3 livres simultanés</strong>
            </div>
            <div class="summary-item">
              <span>Rôle :</span>
              <span>Adhérent lecteur</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { membersService } from '@/services/membersService'
import api from '@/services/api'
import Alerte from '@/components/common/Alerte.vue'

const authStore = useAuthStore()

const savingProfile = ref(false)
const savingPassword = ref(false)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function populateForm() {
  if (authStore.user) {
    profileForm.first_name = authStore.user.first_name || ''
    profileForm.last_name = authStore.user.last_name || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
    profileForm.address = authStore.user.address || ''
  }
}

async function updateProfile() {
  actionAlert.message = ''
  savingProfile.value = true

  try {
    const memberId = authStore.user?.id
    const payload = {
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
      phone: profileForm.phone.trim(),
      address: profileForm.address.trim()
    }

    const res = await membersService.update(memberId, payload)
    if (res.success) {
      authStore.updateUser(res.data)
      actionAlert.type = 'succes'
      actionAlert.message = 'Informations de profil mises à jour avec succès.'
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Impossible de mettre à jour le profil.'
  } finally {
    savingProfile.value = false
  }
}

async function updatePassword() {
  actionAlert.message = ''

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    actionAlert.type = 'erreur'
    actionAlert.message = 'Les nouveaux mots de passe ne correspondent pas.'
    return
  }

  if (passwordForm.newPassword.length < 8) {
    actionAlert.type = 'erreur'
    actionAlert.message = 'Le mot de passe doit comporter au moins 8 caractères.'
    return
  }

  savingPassword.value = true

  try {
    const res = await api.put('/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (res.success) {
      actionAlert.type = 'succes'
      actionAlert.message = 'Mot de passe modifié avec succès.'
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors de la modification du mot de passe.'
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  populateForm()
})
</script>

<style scoped>
.member-space {
  min-height: calc(100vh - 140px);
  background: #f5f7fb;
  padding: 2.5rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── HEADER ────────────────────────────────────────────── */
.member-header {
  margin-bottom: 2rem;
}

.welcome-text h1 {
  font-size: 1.8rem;
  color: #1a237e;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.welcome-text p {
  color: #666;
  font-size: 0.95rem;
}

/* ── TABS ──────────────────────────────────────────────── */
.member-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.tab-item {
  padding: 0.8rem 1.3rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  color: #666;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: #1a237e;
}

.tab-item.active {
  color: #1a237e;
  border-bottom-color: #1a237e;
}

/* ── GRILLE PROFIL ─────────────────────────────────────── */
.profile-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.section-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.2rem;
  color: #1a237e;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.card-header p {
  color: #666;
  font-size: 0.85rem;
}

/* ── FORMULAIRES ────────────────────────────────────────── */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 0.85rem;
}

input, textarea {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  border-color: #1a237e;
}

.input-disabled {
  background: #f8f9fa;
  color: #777;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.75rem;
  color: #888;
}

/* ── RÉCAPITULATIF COMPTE ──────────────────────────────── */
.account-summary {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.account-summary h3 {
  font-size: 0.95rem;
  color: #1a237e;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
}

.badge-active {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

/* ── BOUTONS ────────────────────────────────────────────── */
.btn {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-primary {
  background: #1a237e;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: #11195f;
}

.btn-outline-primary {
  border: 1.5px solid #1a237e;
  color: #1a237e;
  background: white;
}
.btn-outline-primary:hover:not(:disabled) {
  background: #f0f4ff;
}

:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
