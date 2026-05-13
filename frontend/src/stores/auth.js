import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    _persist(data)
    return data
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    _persist(data)
    return data
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function _persist(data) {
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  return { token, user, isAuthenticated, register, login, logout }
})
