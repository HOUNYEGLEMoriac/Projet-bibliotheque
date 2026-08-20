<template>
  <section class="auth-page">
    <div class="auth-card">
      <h1>Mot de passe oublié</h1>
      <p class="subtitle">
        Indiquez votre adresse email pour recevoir les instructions de réinitialisation.
      </p>

      <!-- Alerte Erreur -->
      <Alerte
        v-if="errorMessage"
        :message="errorMessage"
        type="erreur"
        :duree="0"
        @fermer="errorMessage = ''"
      />

      <!-- Alerte Succès -->
      <Alerte
        v-if="successMessage"
        :message="successMessage"
        type="succes"
        :duree="0"
      />

      <form v-if="!emailSent" @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Adresse email du compte</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="votre.email@exemple.com"
            required
            :disabled="loading"
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="!loading">Envoyer le lien de réinitialisation</span>
          <span v-else>Envoi en cours...</span>
        </button>
      </form>

      <div v-else class="post-send-instructions">
        <p>
          Un courrier électronique contenant la procédure de réinitialisation a été envoyé à <strong>{{ email }}</strong> (si un compte y est associé).
        </p>
        <button class="btn-secondary" @click="resetForm">
          Renvoyer une demande avec une autre adresse
        </button>
      </div>

      <p class="auth-footer">
        <RouterLink to="/login" class="back-link">
          Retour à la page de connexion
        </RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '@/services/authService'
import Alerte from '@/components/common/Alerte.vue'

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailSent = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !email.value.includes('@')) {
    errorMessage.value = 'Veuillez saisir une adresse email valide.'
    return
  }

  loading.value = true

  try {
    const res = await authService.forgotPassword(email.value.trim())
    if (res.success) {
      emailSent.value = true
      successMessage.value = 'Demande prise en compte avec succès.'
    }
  } catch (err) {
    errorMessage.value = err.message || 'Une erreur est survenue lors du traitement de votre demande.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  email.value = ''
  emailSent.value = false
  errorMessage.value = ''
  successMessage.value = ''
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
  max-width: 480px;
  background: white;
  border-radius: 12px;
  padding: 2.2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #1a237e;
  font-weight: 700;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.8rem;
  line-height: 1.5;
}

.auth-form {
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
  color: #333;
  font-size: 0.9rem;
}

input {
  height: 46px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 0.9rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.12);
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
}

.btn-submit:hover:not(:disabled) {
  background: #11195f;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.post-send-instructions {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #495057;
}

.btn-secondary {
  margin-top: 1rem;
  background: white;
  border: 1px solid #ced4da;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #495057;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.auth-footer {
  margin-top: 1.8rem;
  text-align: center;
  font-size: 0.95rem;
}

.back-link {
  color: #1a237e;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
