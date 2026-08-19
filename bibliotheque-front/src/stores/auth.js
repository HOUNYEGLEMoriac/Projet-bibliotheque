import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const loading = ref(false)
  const error = ref(null)

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => user.value?.role || null)
  const isAdmin = computed(() => role.value === 'admin')
  const isMember = computed(() => role.value === 'member')
  const fullName = computed(() =>
    user.value
      ? `${user.value.first_name} ${user.value.last_name}`
      : ''
  )
  const initials = computed(() => {
    if (!user.value) return '?'
    const f = user.value.first_name?.[0] || ''
    const l = user.value.last_name?.[0] || ''
    return (f + l).toUpperCase()
  })

  // actions
  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login({ email, password })
      token.value = res.token
      user.value = res.user
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.register(data)
      token.value = res.token
      user.value = res.user
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function updateUser(data) {
    user.value = { ...user.value, ...data }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return {
    token, user, loading, error,
    isLoggedIn, role, isAdmin, isMember, fullName, initials,
    login, register, logout, updateUser
  }
})
