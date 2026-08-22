<template>
  <section class="auth-page">
    <div class="auth-card">
      <h1>Connexion</h1>
      <p class="subtitle">Connectez-vous à votre espace bibliothèque</p>

      <Alerte
        v-if="errorMessage"
        :message="errorMessage"
        type="erreur"
        :duree="0"
        @fermer="errorMessage = ''"
      />

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="votre@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Votre mot de passe"
            required
          />
        </div>

        <div class="form-actions">
          <RouterLink to="/forgot-password" class="forgot-link">
            Mot de passe oublié ?
          </RouterLink>
        </div>

        <button type="submit" class="btn-submit" :disabled="authStore.loading">
          <span v-if="!authStore.loading">Se connecter</span>
          <span v-else>Connexion en cours...</span>
        </button>
      </form>

      <p class="auth-footer">
        Pas encore de compte ?
        <RouterLink to="/register">Créer un compte</RouterLink>
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

const form = reactive({
  email: '',
  password: ''
})

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email || !form.password) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  const result = await authStore.login(form.email, form.password)

  if (!result.success) {
    errorMessage.value = result.message || 'Connexion impossible.'
    return
  }

  if (authStore.isAdmin) {
    router.push('/admin/dashboard')
  } else {
    router.push('/member/dashboard')
  }
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
  max-width: 450px;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-weight: 600;
  color: #333;
}

input {
  height: 44px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  color: #1a237e;
  text-decoration: none;
  font-size: 0.9rem;
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
</style>
