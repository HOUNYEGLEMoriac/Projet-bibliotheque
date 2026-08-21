<template>
  <nav class="navbar">
    <div class="navbar-container">

      <RouterLink to="/" class="navbar-logo">
        BiblioCommune
      </RouterLink>

      <ul class="navbar-liens">
        <li>
          <RouterLink to="/catalogue">Catalogue</RouterLink>
        </li>
        <li>
          <RouterLink to="/search">Recherche</RouterLink>
        </li>
      </ul>

      <div class="navbar-actions">

        <template v-if="!authStore.isLoggedIn">
          <RouterLink to="/login" class="btn btn-outline">
            Connexion
          </RouterLink>
          <RouterLink to="/register" class="btn btn-primary">
            S'inscrire
          </RouterLink>
        </template>

        <template v-else>

          <RouterLink
  v-if="authStore.isMember"
  to="/member/notifications"
  class="btn-icon"
  title="Notifications"
  aria-label="Notifications"
>
  <!-- Icône Cloche -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>

  <!-- Badge pour le nombre de notifications non lues -->
  <span v-if="unreadCount > 0" class="badge">
    {{ unreadCount }}
  </span>
</RouterLink>

          <div class="user-menu" @click="toggleMenu">
            <span class="avatar">
              {{ authStore.initials }}
            </span>
            <span class="user-name">{{ authStore.fullName }}</span>
            <span>▾</span>

            <div v-if="menuOpen" class="dropdown">
              <RouterLink
                v-if="authStore.isMember"
                to="/member/dashboard"
                @click="menuOpen = false"
              >
                Mon espace
              </RouterLink>
              <RouterLink
                v-if="authStore.isAdmin"
                to="/admin/dashboard"
                @click="menuOpen = false"
              >
                Administration
              </RouterLink>
              <RouterLink
                v-if="authStore.isMember"
                to="/member/profile"
                @click="menuOpen = false"
              >
                Mon profil
              </RouterLink>
              <hr />
              <button @click="handleLogout" class="btn-logout">
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

const menuOpen = ref(false)

const unreadCount = computed(() => notifStore.unreadCount)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

async function handleLogout() {
  authStore.logout()
  menuOpen.value = false
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

.btn-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: white;
  text-decoration: none;
}

.btn-icon:hover {
  color: #2563eb; /* Couleur au survol */
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #ef4444; /* Rouge */
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 9999px; /* Forme de pilule/cercle */
  min-width: 18px;
  text-align: center;
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

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-menu:hover {
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

.user-name {
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

.btn-logout {
  color: #e53935 !important;
  font-weight: 500;
}
</style>
