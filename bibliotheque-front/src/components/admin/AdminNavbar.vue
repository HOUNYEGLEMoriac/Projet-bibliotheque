<template>
  <header class="admin-header">
    <div class="admin-nav-container">

      <!-- Logo et titre administration -->
      <div class="admin-brand">
        <RouterLink to="/admin/dashboard" class="brand-title">
          BiblioCommune <span>Admin</span>
        </RouterLink>
      </div>

      <!-- Liens de gestion -->
      <nav class="admin-links">
        <RouterLink to="/admin/dashboard" class="nav-item">
          Tableau de bord
        </RouterLink>
        <RouterLink to="/admin/books" class="nav-item">
          Livres
        </RouterLink>
        <RouterLink to="/admin/categories" class="nav-item">
          Catégories
        </RouterLink>
        <RouterLink to="/admin/members" class="nav-item">
          Adhérents
        </RouterLink>
        <RouterLink to="/admin/loans" class="nav-item">
          Emprunts
        </RouterLink>
        <RouterLink to="/admin/reservations" class="nav-item">
          Réservations
        </RouterLink>
        <RouterLink to="/admin/notifications" class="nav-item">
          Relances
        </RouterLink>
        <RouterLink to="/admin/reports" class="nav-item">
          Rapports
        </RouterLink>
      </nav>

      <!-- Profil Admin et Retour -->
      <div class="admin-user-actions">
        <RouterLink to="/" class="btn-public-site">
          Voir le site public
        </RouterLink>
        <div class="admin-badge">
          {{ authStore.fullName }}
        </div>
        <button @click="handleLogout" class="btn-logout" title="Déconnexion">
          Quitter
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-header {
  background: #1e293b;
  color: white;
  border-bottom: 1px solid #334155;
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.admin-brand .brand-title {
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-title span {
  background: #e53935;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.admin-links {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-item {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: white;
  background: #334155;
}

.nav-item.router-link-active {
  color: white;
  background: #0f172a;
}

.admin-user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-public-site {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border: 1px solid #475569;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-public-site:hover {
  color: white;
  border-color: #94a3b8;
}

.admin-badge {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 600;
}

.btn-logout {
  background: none;
  border: none;
  color: #f87171;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
