import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // ─── STATE ───────────────────────────────────────────
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const chargement = ref(false)
  const erreur = ref(null)

  // ─── GETTERS ─────────────────────────────────────────
  const estConnecte = computed(() => !!token.value)
  const role = computed(() => user.value?.role || null)
  const estAdmin = computed(() => role.value === 'admin')
  const estAdherent = computed(() => role.value === 'adherent')
  const nomComplet = computed(() =>
    user.value ? `${user.value.prenom} ${user.value.nom}` : ''
  )

  // ─── ACTIONS ─────────────────────────────────────────

  async function connexion(email, motDePasse) {
    chargement.value = true
    erreur.value = null
    try {
      const reponse = await authService.connexion({ email, motDePasse })
      token.value = reponse.token
      user.value = reponse.user
      localStorage.setItem('token', reponse.token)
      localStorage.setItem('user', JSON.stringify(reponse.user))
      return { succes: true }
    } catch (err) {
      erreur.value = err.message || 'Erreur de connexion'
      return { succes: false, message: erreur.value }
    } finally {
      chargement.value = false
    }
  }

  async function inscription(donnees) {
    chargement.value = true
    erreur.value = null
    try {
      const reponse = await authService.inscription(donnees)
      token.value = reponse.token
      user.value = reponse.user
      localStorage.setItem('token', reponse.token)
      localStorage.setItem('user', JSON.stringify(reponse.user))
      return { succes: true }
    } catch (err) {
      erreur.value = err.message || "Erreur lors de l'inscription"
      return { succes: false, message: erreur.value }
    } finally {
      chargement.value = false
    }
  }

  function deconnexion() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function mettreAJourUser(nouvellesInfos) {
    user.value = { ...user.value, ...nouvellesInfos }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return {
    // state
    token,
    user,
    chargement,
    erreur,
    // getters
    estConnecte,
    role,
    estAdmin,
    estAdherent,
    nomComplet,
    // actions
    connexion,
    inscription,
    deconnexion,
    mettreAJourUser
  }
})
