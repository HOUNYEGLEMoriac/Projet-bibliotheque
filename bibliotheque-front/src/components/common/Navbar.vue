<template>
  <nav class="navbar">
    <div class="navbar-container">

      <!-- ─── LOGO ─────────────────────────────────── -->
      <RouterLink to="/" class="navbar-logo">
        📚 BiblioCommune
      </RouterLink>

      <!-- ─── LIENS NAVIGATION ──────────────────────── -->
      <ul class="navbar-liens">
        <li>
          <RouterLink to="/catalogue">Catalogue</RouterLink>
        </li>
        <li>
          <RouterLink to="/recherche">Recherche</RouterLink>
        </li>
      </ul>

      <!-- ─── ACTIONS DROITE ────────────────────────── -->
      <div class="navbar-actions">

        <!-- Non connecté -->
        <template v-if="!authStore.estConnecte">
          <RouterLink to="/connexion" class="btn btn-outline">
            Connexion
          </RouterLink>
          <RouterLink to="/inscription" class="btn btn-primary">
            S'inscrire
          </RouterLink>
        </template>

        <!-- Connecté -->
        <template v-else>
          <!-- Notifications -->
          <RouterLink
            v-if="authStore.estAdherent"
            to="/espace/notifications"
            class="btn-icone"
          >
            🔔
            <span v-if="nbNotifications > 0" class="badge">
              {{ nbNotifications }}
            </span>
          </RouterLink>

          <!-- Menu utilisateur -->
          <div class="menu-utilisateur" @click="toggleMenu">
            <span class="avatar">
              {{ initiales }}
            </span>
            <span class="nom-user">{{ authStore.nomComplet }}</span>
            <span>▾</span>

            <!-- Dropdown -->
            <div v-if="menuOuvert" class="dropdown">
              <RouterLink
                v-if="authStore.estAdherent"
                to="/espace/dashboard"
                @click="menuOuvert = false"
              >
                Mon espace
              </RouterLink>
              <RouterLink
                v-if="authStore.estAdmin"
                to="/admin/dashboard"
                @click="menuOuvert = false"
              >
                Administration
              </RouterLink>
              <RouterLink
                v-if="authStore.estAdherent"
                to="/espace/profil"
                @click="menuOuvert = false"
              >
                Mon profil
              </RouterLink>
              <hr />
              <button @click="seDeconnecter" class="btn-deconnexion">
                Se déconnecter
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationsStore()

const menuOuvert = ref(false)

const nbNotifications = computed(() => notifStore.nbNonLues)

const initiales = computed(() => {
  if (!authStore.user) return '?'
  const p = authStore.user.prenom?.[0] || ''
  const n = authStore.user.nom?.[0] || ''
  return (p + n).toUpperCase()
})

function toggleMenu() {
  menuOuvert.value = !menuOuvert.value
}

async function seDeconnecter() {
  authStore.deconnexion()
  menuOuvert.value = false
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background-color: #1a237e;
  color: white;
  padding: 0 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 65px;
}

.navbar-logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.navbar-liens {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.navbar-liens a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-liens a:hover,
.navbar-liens a.router-link-active {
  color: white;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #e53935;
  color: white;
}

.btn-outline {
  border: 1px solid white;
  color: white;
  background: transparent;
}

.btn-icone {
  position: relative;
  font-size: 1.3rem;
  cursor: pointer;
  text-decoration: none;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e53935;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-utilisateur {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-utilisateur:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar {
  background: #e53935;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.nom-user {
  font-size: 0.9rem;
}

.dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  color: #333;
  border-radius: 8px;
  min-width: 180px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  z-index: 200;
}

.dropdown a,
.dropdown button {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown a:hover,
.dropdown button:hover {
  background: #f5f5f5;
}

.dropdown hr {
  margin: 0.3rem 0;
  border: none;
  border-top: 1px solid #eee;
}

.btn-deconnexion {
  color: #e53935 !important;
  font-weight: 500;
}
</style>
