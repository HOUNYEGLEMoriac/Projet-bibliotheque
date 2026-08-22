<template>
  <section class="auth-page">
    <div class="auth-card">
      <h1>Créer un compte</h1>
      <p class="subtitle">Rejoignez la bibliothèque communautaire</p>

      <Alerte v-if="errorMessage" :message="errorMessage" type="erreur" :duree="0" @fermer="errorMessage = ''" />

      <form @submit.prevent="handleSubmit" class="auth-form">

        <div class="form-row">
          <div class="form-group">
            <label for="first_name">Prénom *</label>
            <input id="first_name" v-model="form.first_name" type="text" placeholder="Jean" required />
            <span v-if="errors.first_name" class="erreur-champ">{{ errors.first_name }}</span>
          </div>

          <div class="form-group">
            <label for="last_name">Nom *</label>
            <input id="last_name" v-model="form.last_name" type="text" placeholder="Dupont" required />
            <span v-if="errors.last_name" class="erreur-champ">{{ errors.last_name }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input id="email" v-model="form.email" type="email" placeholder="jean.dupont@email.com" required />
          <span v-if="errors.email" class="erreur-champ">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Téléphone</label>
          <input id="phone" v-model="form.phone" type="tel" placeholder="06 12 34 56 78" />
        </div>

        <div class="form-group">
          <label for="address">Adresse</label>
          <input id="address" v-model="form.address" type="text" placeholder="12 rue des Lilas, Paris" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe *</label>
          <div class="input-password">
            <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              placeholder="Minimum 8 caractères" required />
            <button type="button" @click="voirMdp = !voirMdp" class="btn-eye" title="Afficher/Masquer le mot de passe">
              <!-- Icône œil barré (Quand le mot de passe est affiché) -->
              <svg v-if="voirMdp" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
                </path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>

              <!-- Icône œil ouvert (Quand le mot de passe est masqué) -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="erreur-champ">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe *</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password"
            placeholder="Répétez votre mot de passe" required />
          <span v-if="errors.confirmPassword" class="erreur-champ">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.acceptTerms" required />
            <span>
              J'accepte les <a href="#" @click.prevent>conditions d'utilisation</a>
            </span>
          </label>
        </div>

        <button type="submit" class="btn-submit" :disabled="authStore.loading">
          <span v-if="!authStore.loading">Créer mon compte</span>
          <span v-else>Création en cours...</span>
        </button>
      </form>

      <p class="auth-footer">
        Déjà inscrit ?
        <RouterLink to="/login">Se connecter</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Alerte from '@/components/common/Alerte.vue'

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')
const showPassword = ref(false)

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

function validateForm() {
  let valid = true
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (!form.first_name.trim()) {
    errors.first_name = 'Le prénom est requis.'
    valid = false
  }

  if (!form.last_name.trim()) {
    errors.last_name = 'Le nom est requis.'
    valid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email || !emailRegex.test(form.email)) {
    errors.email = 'Adresse email invalide.'
    valid = false
  }

  if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    valid = false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!validateForm()) return

  const payload = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    password: form.password
  }

  const result = await authStore.register(payload)

  if (!result.success) {
    errorMessage.value = result.message || "Erreur lors de l'inscription."
    return
  }

  router.push('/member/dashboard')
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f5f7fb;
}

.auth-card {
  width: 100%;
  max-width: 560px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1a237e;
}

.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  font-size: 0.95rem;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"] {
  height: 44px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 0.9rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

input:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.12);
}

.erreur-champ {
  font-size: 0.82rem;
  color: #c62828;
}

.input-password {
  display: flex;
  align-items: center;
  position: relative;
}

.input-password input {
  flex: 1;
  padding-right: 5rem;
}

.toggle-mdp {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #1a237e;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.btn-submit {
  height: 46px;
  border: none;
  border-radius: 8px;
  background: #1a237e;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: #11195f;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.4rem;
  text-align: center;
  color: #555;
  font-size: 0.95rem;
}

.auth-footer a {
  color: #1a237e;
  font-weight: 600;
  text-decoration: none;
}

.btn-eye {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  padding: 4px;
}

.btn-eye:hover {
  color: #111827;
}
</style>
