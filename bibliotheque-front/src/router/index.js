import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ── PUBLIC ───────────────────────────────────────────────
import Home from '@/views/public/Home.vue'
import Catalogue from '@/views/public/Catalogue.vue'
import BookDetail from '@/views/public/BookDetail.vue'
import Search from '@/views/public/Search.vue'
import Register from '@/views/public/Register.vue'
import Login from '@/views/public/Login.vue'
import ForgotPassword from '@/views/public/ForgotPassword.vue'

// ── MEMBER ───────────────────────────────────────────────
import MemberDashboard from '@/views/member/Dashboard.vue'
import MyLoans from '@/views/member/MyLoans.vue'
import MyHistory from '@/views/member/MyHistory.vue'
import MyReservations from '@/views/member/MyReservations.vue'
import MyProfile from '@/views/member/MyProfile.vue'
import MyNotifications from '@/views/member/MyNotifications.vue'

// ── ADMIN ────────────────────────────────────────────────
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminBooks from '@/views/admin/books/BookList.vue'
import AdminAddBook from '@/views/admin/books/BookAdd.vue'
import AdminEditBook from '@/views/admin/books/BookEdit.vue'
import AdminCategories from '@/views/admin/Categories.vue'
import AdminMembers from '@/views/admin/members/MemberList.vue'
import AdminMemberDetail from '@/views/admin/members/MemberDetail.vue'
import AdminLoans from '@/views/admin/loans/LoanList.vue'
import AdminLoansOverdue from '@/views/admin/loans/LoanOverdue.vue'
import AdminReturn from '@/views/admin/loans/LoanReturn.vue'
import AdminReservations from '@/views/admin/Reservations.vue'
import AdminNotifications from '@/views/admin/notifications/NotificationConfig.vue'
import AdminNotificationsHistory from '@/views/admin/notifications/NotificationHistory.vue'
import AdminReports from '@/views/admin/Reports.vue'

// ── SYSTEM ───────────────────────────────────────────────
import NotFound from '@/views/system/NotFound.vue'
import Forbidden from '@/views/system/Forbidden.vue'
import ServerError from '@/views/system/ServerError.vue'

const routes = [
  // PUBLIC
  { path: '/', name: 'Home', component: Home },
  { path: '/catalogue', name: 'Catalogue', component: Catalogue },
  { path: '/catalogue/:id', name: 'BookDetail', component: BookDetail },
  { path: '/search', name: 'Search', component: Search },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { guestOnly: true }
  },

  // MEMBER
  { path: '/member', redirect: '/member/dashboard' },
  {
    path: '/member/dashboard',
    name: 'MemberDashboard',
    component: MemberDashboard,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/loans',
    name: 'MyLoans',
    component: MyLoans,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/history',
    name: 'MyHistory',
    component: MyHistory,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/reservations',
    name: 'MyReservations',
    component: MyReservations,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/profile',
    name: 'MyProfile',
    component: MyProfile,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/notifications',
    name: 'MyNotifications',
    component: MyNotifications,
    meta: { requiresAuth: true, role: 'member' }
  },

  // ADMIN
  { path: '/admin', redirect: '/admin/dashboard' },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/books',
    name: 'AdminBooks',
    component: AdminBooks,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/books/add',
    name: 'AdminAddBook',
    component: AdminAddBook,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/books/edit/:id',
    name: 'AdminEditBook',
    component: AdminEditBook,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: AdminCategories,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/members',
    name: 'AdminMembers',
    component: AdminMembers,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/members/:id',
    name: 'AdminMemberDetail',
    component: AdminMemberDetail,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/loans',
    name: 'AdminLoans',
    component: AdminLoans,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/loans/overdue',
    name: 'AdminLoansOverdue',
    component: AdminLoansOverdue,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/loans/return',
    name: 'AdminReturn',
    component: AdminReturn,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reservations',
    name: 'AdminReservations',
    component: AdminReservations,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/notifications',
    name: 'AdminNotifications',
    component: AdminNotifications,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/notifications/history',
    name: 'AdminNotificationsHistory',
    component: AdminNotificationsHistory,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: AdminReports,
    meta: { requiresAuth: true, role: 'admin' }
  },

  // SYSTEM
  { path: '/403', name: 'Forbidden', component: Forbidden },
  { path: '/500', name: 'ServerError', component: ServerError },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Login' })
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return next(
      auth.isAdmin ? { name: 'AdminDashboard' } : { name: 'MemberDashboard' }
    )
  }

  if (to.meta.role && to.meta.role !== auth.role) {
    return next({ name: 'Forbidden' })
  }

  next()
})

export default router
