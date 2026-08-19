import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ===== PAGES PUBLIQUES =====
import Accueil from '@/views/public/Accueil.vue'
import Catalogue from '@/views/public/Catalogue.vue'
import DetailLivre from '@/views/public/DetailLivre.vue'
import Recherche from '@/views/public/Recherche.vue'
import Inscription from '@/views/public/Inscription.vue'
import Connexion from '@/views/public/Connexion.vue'
import MotDePasseOublie from '@/views/public/MotDePasseOublie.vue'

// ===== PAGES ADHÉRENT =====
import AdherentDashboard from '@/views/adherent/Dashboard.vue'
import MesEmprunts from '@/views/adherent/MesEmprunts.vue'
import MonHistorique from '@/views/adherent/MonHistorique.vue'
import MesReservations from '@/views/adherent/MesReservations.vue'
import MonProfil from '@/views/adherent/MonProfil.vue'
import MesNotifications from '@/views/adherent/MesNotifications.vue'

// ===== PAGES ADMIN =====
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminLivres from '@/views/admin/livres/ListeLivres.vue'
import AdminAjouterLivre from '@/views/admin/livres/AjouterLivre.vue'
import AdminModifierLivre from '@/views/admin/livres/ModifierLivre.vue'
import AdminCategories from '@/views/admin/Categories.vue'
import AdminAdherents from '@/views/admin/adherents/ListeAdherents.vue'
import AdminDetailAdherent from '@/views/admin/adherents/DetailAdherent.vue'
import AdminEmprunts from '@/views/admin/emprunts/ListeEmprunts.vue'
import AdminEmpruntsRetard from '@/views/admin/emprunts/EmpruntsRetard.vue'
import AdminRetour from '@/views/admin/emprunts/EnregistrerRetour.vue'
import AdminReservations from '@/views/admin/Reservations.vue'
import AdminRelances from '@/views/admin/relances/ConfigRelances.vue'
import AdminHistoriqueRelances from '@/views/admin/relances/HistoriqueRelances.vue'
import AdminRapports from '@/views/admin/Rapports.vue'

// ===== PAGES SYSTÈME =====
import NotFound from '@/views/systeme/NotFound.vue'
import Interdit from '@/views/systeme/Interdit.vue'
import Erreur from '@/views/systeme/Erreur.vue'

const routes = [
  // ─── PUBLIQUES ───────────────────────────────────────
  {
    path: '/',
    name: 'Accueil',
    component: Accueil,
    meta: { requiresAuth: false }
  },
  {
    path: '/catalogue',
    name: 'Catalogue',
    component: Catalogue,
    meta: { requiresAuth: false }
  },
  {
    path: '/catalogue/:id',
    name: 'DetailLivre',
    component: DetailLivre,
    meta: { requiresAuth: false }
  },
  {
    path: '/recherche',
    name: 'Recherche',
    component: Recherche,
    meta: { requiresAuth: false }
  },
  {
    path: '/inscription',
    name: 'Inscription',
    component: Inscription,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/connexion',
    name: 'Connexion',
    component: Connexion,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/mot-de-passe-oublie',
    name: 'MotDePasseOublie',
    component: MotDePasseOublie,
    meta: { requiresAuth: false, guestOnly: true }
  },

  // ─── ADHÉRENT ─────────────────────────────────────────
  {
    path: '/espace',
    redirect: '/espace/dashboard'
  },
  {
    path: '/espace/dashboard',
    name: 'AdherentDashboard',
    component: AdherentDashboard,
    meta: { requiresAuth: true, role: 'adherent' }
  },
  {
    path: '/espace/emprunts',
    name: 'MesEmprunts',
    component: MesEmprunts,
    meta: { requiresAuth: true, role: 'adherent' }
  },
  {
    path: '/espace/historique',
    name: 'MonHistorique',
    component: MonHistorique,
    meta: { requiresAuth: true, role: 'adherent' }
  },
  {
    path: '/espace/reservations',
    name: 'MesReservations',
    component: MesReservations,
    meta: { requiresAuth: true, role: 'adherent' }
  },
  {
    path: '/espace/profil',
    name: 'MonProfil',
    component: MonProfil,
    meta: { requiresAuth: true, role: 'adherent' }
  },
  {
    path: '/espace/notifications',
    name: 'MesNotifications',
    component: MesNotifications,
    meta: { requiresAuth: true, role: 'adherent' }
  },

  // ─── ADMIN ────────────────────────────────────────────
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/livres',
    name: 'AdminLivres',
    component: AdminLivres,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/livres/ajouter',
    name: 'AdminAjouterLivre',
    component: AdminAjouterLivre,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/livres/modifier/:id',
    name: 'AdminModifierLivre',
    component: AdminModifierLivre,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: AdminCategories,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/adherents',
    name: 'AdminAdherents',
    component: AdminAdherents,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/adherents/:id',
    name: 'AdminDetailAdherent',
    component: AdminDetailAdherent,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/emprunts',
    name: 'AdminEmprunts',
    component: AdminEmprunts,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/emprunts/retards',
    name: 'AdminEmpruntsRetard',
    component: AdminEmpruntsRetard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/emprunts/retour',
    name: 'AdminRetour',
    component: AdminRetour,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reservations',
    name: 'AdminReservations',
    component: AdminReservations,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/relances',
    name: 'AdminRelances',
    component: AdminRelances,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/relances/historique',
    name: 'AdminHistoriqueRelances',
    component: AdminHistoriqueRelances,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/rapports',
    name: 'AdminRapports',
    component: AdminRapports,
    meta: { requiresAuth: true, role: 'admin' }
  },

  // ─── SYSTÈME ──────────────────────────────────────────
  {
    path: '/403',
    name: 'Interdit',
    component: Interdit
  },
  {
    path: '/500',
    name: 'Erreur',
    component: Erreur
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Retour en haut de page à chaque navigation
  scrollBehavior() {
    return { top: 0 }
  }
})

// ─── GARDE DE NAVIGATION ──────────────────────────────
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const estConnecte = authStore.estConnecte
  const roleUser = authStore.role

  // Page nécessite connexion
  if (to.meta.requiresAuth && !estConnecte) {
    return next({ name: 'Connexion' })
  }

  // Page réservée aux non-connectés (ex: login, register)
  if (to.meta.guestOnly && estConnecte) {
    if (roleUser === 'admin') return next({ name: 'AdminDashboard' })
    return next({ name: 'AdherentDashboard' })
  }

  // Vérification du rôle
  if (to.meta.role && to.meta.role !== roleUser) {
    return next({ name: 'Interdit' })
  }

  next()
})

export default router
