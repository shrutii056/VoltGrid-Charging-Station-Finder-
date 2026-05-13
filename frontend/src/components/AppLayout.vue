<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-bolt">⚡</span>
        <span class="brand-name">VoltGrid</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: route.name === 'Stations' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Stations
        </router-link>
        <router-link to="/map" class="nav-item" :class="{ active: route.name === 'Map' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Map View
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ auth.user?.name?.[0]?.toUpperCase() }}</div>
          <div>
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role">{{ auth.user?.role }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; }

.sidebar {
  width: 220px; flex-shrink: 0;
  background: var(--bg2); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
}

.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 22px 20px; border-bottom: 1px solid var(--border);
}
.brand-bolt { font-size: 1.4rem; filter: drop-shadow(0 0 8px #00e5a080); }
.brand-name { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--accent); }

.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius);
  color: var(--text2); text-decoration: none;
  font-size: 0.875rem; font-weight: 500;
  transition: all var(--transition);
}
.nav-item:hover { color: var(--text); background: var(--bg3); }
.nav-item.active { color: var(--accent); background: var(--accent-dim); }

.sidebar-footer {
  padding: 16px; border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
.user-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--accent); color: #000;
  font-family: var(--font-mono); font-weight: 700; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name { font-size: 0.82rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.72rem; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }

.logout-btn {
  background: none; border: 1px solid var(--border2); border-radius: var(--radius);
  color: var(--text2); padding: 6px; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; transition: all var(--transition);
}
.logout-btn:hover { color: var(--danger); border-color: var(--danger); }

.main-content { margin-left: 220px; flex: 1; min-height: 100vh; }
</style>
