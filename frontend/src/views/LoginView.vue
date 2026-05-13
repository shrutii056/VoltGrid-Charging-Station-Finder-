<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="grid-lines"></div>
    </div>

    <div class="auth-card">
      <div class="auth-brand">
        <div class="brand-icon">⚡</div>
        <h1>VoltGrid</h1>
        <p>EV Charging Network Management</p>
      </div>

      <div class="auth-tabs">
        <button :class="['tab', mode === 'login' && 'active']" @click="mode = 'login'">Sign In</button>
        <button :class="['tab', mode === 'register' && 'active']" @click="mode = 'register'">Register</button>
      </div>

      <!-- Login Form -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="alert alert-error" v-if="error">{{ error }}</div>

        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="you@example.com" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="form.password" type="password" class="input" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading">Authenticating…</span>
          <span v-else>Sign In →</span>
        </button>

        <p class="auth-hint">Demo: admin@voltgrid.io / password123</p>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="alert alert-error" v-if="error">{{ error }}</div>

        <div class="field">
          <label>Full Name</label>
          <input v-model="form.name" type="text" class="input" placeholder="Jane Smith" required />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="you@example.com" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="form.password" type="password" class="input" placeholder="Min. 6 characters" required />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading">Creating account…</span>
          <span v-else">Create Account →</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const mode    = ref('login')
const loading = ref(false)
const error   = ref('')
const form    = reactive({ name: '', email: '', password: '' })

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(form.name, form.email, form.password)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 20px; position: relative; overflow: hidden;
}
.auth-bg {
  position: fixed; inset: 0; z-index: 0;
  background: radial-gradient(ellipse at 30% 50%, #00e5a008 0%, transparent 60%),
              radial-gradient(ellipse at 70% 20%, #4fa3ff06 0%, transparent 50%);
}
.grid-lines {
  position: absolute; inset: 0; opacity: 0.15;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
}
.auth-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: 16px; padding: 36px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,160,0.05);
}
.auth-brand { text-align: center; margin-bottom: 28px; }
.brand-icon { font-size: 2.5rem; line-height: 1; margin-bottom: 8px; filter: drop-shadow(0 0 20px #00e5a060); }
.auth-brand h1 { font-size: 1.8rem; color: var(--accent); margin-bottom: 4px; letter-spacing: -0.02em; }
.auth-brand p { color: var(--text2); font-size: 0.85rem; }

.auth-tabs {
  display: flex; border: 1px solid var(--border); border-radius: var(--radius);
  margin-bottom: 24px; overflow: hidden;
}
.tab {
  flex: 1; padding: 9px; font-family: var(--font-body); font-size: 0.875rem;
  font-weight: 500; cursor: pointer; border: none;
  background: transparent; color: var(--text2); transition: all var(--transition);
}
.tab.active { background: var(--accent); color: #000; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; }

.auth-hint {
  text-align: center; font-size: 0.75rem; color: var(--text3);
  font-family: var(--font-mono); padding: 8px;
  background: var(--bg3); border-radius: var(--radius); border: 1px solid var(--border);
}
</style>
