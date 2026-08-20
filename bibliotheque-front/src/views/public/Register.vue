<template>
  <section class="auth-page">
    <div class="auth-card">
      <h1>Créer un compte</h1>
      <p class="subtitle">Rejoignez la bibliothèque communautaire</p>

      <Alerte
        v-if="messageErreur"
        :message="messageErreur"
        type="erreur"
        :duree="0"
        @fermer="messageErreur = ''"
      />

      <Alerte
        v-if="messageSucces"
        :message="messageSucces"
        type="succes"
        :duree="0"
      />

      <form @submit.prevent="soumettreFormulaire" class="auth-form">

        <div class="form-row">
          <div class="form-group">
            <label for="prenom">Prénom</label>
            <input
              id="prenom"
              v-model="form.prenom"
              type="text"
              placeholder="Jean"
              required
            />
            <span v-if="erreurs.prenom" class="erreur-champ">
              {{ erreurs.prenom }}
            </span>
          </div>

          <div class="form-group">
            <label for="nom">Nom</label>
            <input
              id="nom"
              v-model="form.nom"
              type="text"
              placeholder="Dupont"
              required
            />
            <span v-if="erreurs.nom" class="erreur-champ">
              {{ erreurs.nom }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="jean.dupont@email.com"
            required
          />
          <span v-if="erreurs.email" class="erreur-champ">
            {{ erreurs.email }}
          </span>
        </div>

        <div class="form-group">
          <label for="telephone">Téléphone</label>
          <input
            id="telephone"
            v-model="form.telephone"
            type="tel"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div class="form-group">
          <label for="adresse">Adresse</label>
          <input
            id="adresse"
            v-model="form.adresse"
            type="text"
            placeholder="12 rue des Lilas, Paris"
          />
        </div>

        <div class="form-group">
          <label for="motDePasse">Mot de passe</label>
          <div class="input-password">
            <input
              id="motDePasse"
              v-model="form.motDePasse"
              :type="voirMdp ? 'text' : 'password'"
              placeholder="Minimum 8 caractères"
              required
            />
            <button
  type="button"
  @click="voirMdp = !voirMdp"
  class="btn-eye"
  title="Afficher/Masquer le mot de passe"
>
  <!-- Icône œil barré (Quand le mot de passe est affiché) -->
  <svg
    v-if="voirMdp"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>

  <!-- Icône œil ouvert (Quand le mot de passe est masqué) -->
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
</button>
          </div>
          <span v-if="erreurs.motDePasse" class="erreur-champ">
            {{ erreurs.motDePasse }}
          </span>
          <div class="force-mdp" v-if="form.motDePasse">
            <div
              class="barre"
              :class="classeForceMdp"
              :style="{ width: pourcentageForceMdp + '%' }"
            ></div>
            <span class="label-force">{{ labelForceMdp }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmerMdp">Confirmer le mot de passe</label>
          <input
            id="confirmerMdp"
            v-model="form.confirmerMdp"
            type="password"
            placeholder="Répétez votre mot de passe"
            required
          />
          <span v-if="erreurs.confirmerMdp" class="erreur-champ">
            {{ erreurs.confirmerMdp }}
          </span>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.accepterConditions"
              required
            />
            <span>
              J'accepte les
              <a href="#" @click.prevent>conditions d'utilisation</a>
            </span>
          </label>
          <span v-if="erreurs.accepterConditions" class="erreur-champ">
            {{ erreurs.accepterConditions }}
          </span>
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="authStore.chargement"
        >
          <span v-if="!authStore.chargement">Créer mon compte</span>
          <span v-else>Création en cours...</span>
        </button>
      </form>

      <p class="auth-footer">
        Déjà inscrit ?
        <RouterLink to="/connexion">Se connecter</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Alerte from '@/components/common/Alerte.vue'

const router = useRouter()
const authStore = useAuthStore()

const messageErreur = ref('')
const messageSucces = ref('')
const voirMdp = ref(false)

const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  adresse: '',
  motDePasse: '',
  confirmerMdp: '',
  accepterConditions: false
})

const erreurs = reactive({
  prenom: '',
  nom: '',
  email: '',
  motDePasse: '',
  confirmerMdp: '',
  accepterConditions: ''
})

// ─── FORCE DU MOT DE PASSE ────────────────────────────
const scoreForceMdp = computed(() => {
  const mdp = form.motDePasse
  if (!mdp) return 0
  let score = 0
  if (mdp.length >= 8) score++
  if (/[A-Z]/.test(mdp)) score++
  if (/[0-9]/.test(mdp)) score++
  if (/[^A-Za-z0-9]/.test(mdp)) score++
  return score
})

const pourcentageForceMdp = computed(() => (scoreForceMdp.value / 4) * 100)

const labelForceMdp = computed(() => {
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  return labels[scoreForceMdp.value]
})

const classeForceMdp = computed(() => {
  const classes = ['tres-faible', 'faible', 'moyen', 'fort', 'tres-fort']
  return classes[scoreForceMdp.value]
})

// ─── VALIDATION ───────────────────────────────────────
function validerFormulaire() {
  let valide = true

  Object.keys(erreurs).forEach((k) => (erreurs[k] = ''))

  if (!form.prenom.trim()) {
    erreurs.prenom = 'Le prénom est requis.'
    valide = false
  }

  if (!form.nom.trim()) {
    erreurs.nom = 'Le nom est requis.'
    valide = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email || !emailRegex.test(form.email)) {
    erreurs.email = 'Adresse email invalide.'
    valide = false
  }

  if (form.motDePasse.length < 8) {
    erreurs.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères.'
    valide = false
  }

  if (form.motDePasse !== form.confirmerMdp) {
    erreurs.confirmerMdp = 'Les mots de passe ne correspondent pas.'
    valide = false
  }

  if (!form.accepterConditions) {
    erreurs.accepterConditions = "Vous devez accepter les conditions d'utilisation."
    valide = false
  }

  return valide
}

// ─── SOUMISSION ───────────────────────────────────────
async function soumettreFormulaire() {
  messageErreur.value = ''
  messageSucces.value = ''

  if (!validerFormulaire()) return

  const donnees = {
    prenom: form.prenom.trim(),
    nom: form.nom.trim(),
    email: form.email,
    telephone: form.telephone,
    adresse: form.adresse,
    motDePasse: form.motDePasse
  }

  const result = await authStore.register(data)
if (!result.success) {
  errorMessage.value = result.message
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

.force-mdp {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.3rem;
}

.barre {
  height: 5px;
  border-radius: 4px;
  transition: width 0.3s, background-color 0.3s;
  max-width: 200px;
}

.tres-faible { background: #e53935; }
.faible      { background: #fb8c00; }
.moyen       { background: #fdd835; }
.fort        { background: #43a047; }
.tres-fort   { background: #1b5e20; }

.label-force {
  font-size: 0.8rem;
  color: #555;
}

.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
  gap: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label a {
  color: #1a237e;
  text-decoration: underline;
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



