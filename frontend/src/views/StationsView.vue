<template>
  <AppLayout>
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Charging Stations</h2>
          <p class="page-subtitle">{{ store.stations.length }} stations · {{ activeCount }} active</p>
        </div>
        <button class="btn btn-primary" @click="openModal(null)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Station
        </button>
      </div>

      <!-- Filters -->
      <div class="filters card mb-2">
        <div class="filter-row">
          <div class="field">
            <label>Status</label>
            <select v-model="filters.status" class="select" @change="applyFilters">
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="field">
            <label>Connector Type</label>
            <select v-model="filters.connectorType" class="select" @change="applyFilters">
              <option value="">All</option>
              <option v-for="c in connectors" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="field">
            <label>Min Power (kW)</label>
            <input v-model.number="filters.minPower" type="number" class="input" placeholder="0" @change="applyFilters" />
          </div>
          <div class="field">
            <label>Max Power (kW)</label>
            <input v-model.number="filters.maxPower" type="number" class="input" placeholder="350" @change="applyFilters" />
          </div>
          <button class="btn btn-outline btn-sm" style="align-self:flex-end; height:40px" @click="resetFilters">Reset</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="state-msg">
        <div class="spinner"></div>
        Loading stations…
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="alert alert-error">{{ store.error }}</div>

      <!-- Empty -->
      <div v-else-if="!store.stations.length" class="state-msg empty">
        <div class="empty-icon">⚡</div>
        <p>No stations found.</p>
        <button class="btn btn-primary" @click="openModal(null)">Add your first station</button>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap card">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Connector</th>
              <th>Power</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in store.stations" :key="s._id">
              <td>
                <div class="station-name">{{ s.name }}</div>
                <div class="station-meta" v-if="s.location.address">{{ s.location.address }}</div>
              </td>
              <td class="mono">
                {{ s.location.latitude.toFixed(4) }}, {{ s.location.longitude.toFixed(4) }}
              </td>
              <td><span class="badge badge-connector">{{ s.connectorType }}</span></td>
              <td class="mono">{{ s.powerOutput }} kW</td>
              <td>
                <span :class="['badge', s.status === 'Active' ? 'badge-active' : 'badge-inactive']">
                  <span class="dot"></span>{{ s.status }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-outline btn-sm" @click="openModal(s)">Edit</button>
                  <button class="btn btn-danger btn-sm" @click="confirmDelete(s)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Station Modal -->
    <StationModal v-if="showModal" :station="editTarget" @close="showModal = false" @saved="applyFilters" />

    <!-- Delete Confirm Modal -->
    <div class="modal-backdrop" v-if="deleteTarget" @click.self="deleteTarget = null">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h3 style="font-size:1rem; font-family:var(--font-mono)">Confirm Delete</h3>
        </div>
        <div class="modal-body">
          <p style="color:var(--text2)">Delete <strong style="color:var(--text)">{{ deleteTarget.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="handleDelete" :disabled="deleting">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import StationModal from '../components/StationModal.vue'
import { useStationsStore } from '../stores/stations'

const store = useStationsStore()
const connectors = ['CCS', 'CHAdeMO', 'Type 2', 'Type 1', 'GB/T', 'Tesla']

const showModal  = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const deleting   = ref(false)

const filters = reactive({ status: '', connectorType: '', minPower: '', maxPower: '' })

const activeCount = computed(() => store.stations.filter(s => s.status === 'Active').length)

onMounted(() => applyFilters())

function applyFilters() {
  store.fetchStations({ ...filters })
}

function resetFilters() {
  filters.status = ''; filters.connectorType = ''; filters.minPower = ''; filters.maxPower = ''
  applyFilters()
}

function openModal(station) {
  editTarget.value = station
  showModal.value = true
}

function confirmDelete(station) {
  deleteTarget.value = station
}

async function handleDelete() {
  deleting.value = true
  try {
    await store.deleteStation(deleteTarget.value._id)
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.page { padding: 28px 32px; max-width: 1100px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
.page-title { font-size: 1.5rem; font-family: var(--font-mono); }
.page-subtitle { color: var(--text2); font-size: 0.85rem; margin-top: 3px; }

.filters { padding: 16px 20px; }
.filter-row { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; }
.filter-row .field { min-width: 140px; flex: 1; }

.table-wrap { padding: 0; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th {
  padding: 12px 16px; text-align: left;
  font-size: 0.72rem; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text3); border-bottom: 1px solid var(--border); font-weight: 600;
}
.table td {
  padding: 14px 16px; border-bottom: 1px solid var(--border);
  font-size: 0.875rem; vertical-align: middle;
}
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: var(--bg3); }

.station-name { font-weight: 500; }
.station-meta { font-size: 0.75rem; color: var(--text3); margin-top: 2px; }
.mono { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text2); }
.action-btns { display: flex; gap: 6px; }

.dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor;
  display: inline-block;
}

.state-msg {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; gap: 12px; color: var(--text2);
}
.empty-icon { font-size: 3rem; opacity: 0.3; }
.spinner {
  width: 28px; height: 28px; border: 2px solid var(--border2);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.mb-2 { margin-bottom: 16px; }
</style>
