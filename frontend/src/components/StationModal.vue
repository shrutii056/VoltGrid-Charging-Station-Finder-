<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 style="font-size:1rem; font-family: var(--font-mono)">
          {{ station ? '⟳ Edit Station' : '+ New Station' }}
        </h3>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="modal-body">
          <div class="alert alert-error" v-if="error">{{ error }}</div>

          <div class="field mb-2">
            <label>Station Name</label>
            <input v-model="form.name" class="input" placeholder="Downtown Fast Charger" required />
          </div>

          <div class="grid-2 mb-2">
            <div class="field">
              <label>Latitude</label>
              <input v-model.number="form.location.latitude" type="number" step="any"
                class="input" placeholder="28.6139" min="-90" max="90" required />
            </div>
            <div class="field">
              <label>Longitude</label>
              <input v-model.number="form.location.longitude" type="number" step="any"
                class="input" placeholder="77.2090" min="-180" max="180" required />
            </div>
          </div>

          <div class="field mb-2">
            <label>Address (optional)</label>
            <input v-model="form.location.address" class="input" placeholder="Connaught Place, New Delhi" />
          </div>

          <div class="grid-2 mb-2">
            <div class="field">
              <label>Power Output (kW)</label>
              <input v-model.number="form.powerOutput" type="number" step="0.1"
                class="input" placeholder="150" min="0" required />
            </div>
            <div class="field">
              <label>Status</label>
              <select v-model="form.status" class="select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Connector Type</label>
            <select v-model="form.connectorType" class="select" required>
              <option value="">— Select —</option>
              <option v-for="c in connectors" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving…' : (station ? 'Save Changes' : 'Create Station') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useStationsStore } from '../stores/stations'

const props = defineProps({ station: Object })
const emit  = defineEmits(['close', 'saved'])

const store    = useStationsStore()
const loading  = ref(false)
const error    = ref('')
const connectors = ['CCS', 'CHAdeMO', 'Type 2', 'Type 1', 'GB/T', 'Tesla']

const form = reactive({
  name: '',
  location: { latitude: '', longitude: '', address: '' },
  status: 'Active',
  powerOutput: '',
  connectorType: ''
})

onMounted(() => {
  if (props.station) {
    form.name = props.station.name
    form.location.latitude  = props.station.location.latitude
    form.location.longitude = props.station.location.longitude
    form.location.address   = props.station.location.address || ''
    form.status        = props.station.status
    form.powerOutput   = props.station.powerOutput
    form.connectorType = props.station.connectorType
  }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (props.station) {
      await store.updateStation(props.station._id, form)
    } else {
      await store.createStation(form)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    error.value = e.response?.data?.message || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.icon-btn {
  background: none; border: none; color: var(--text2); cursor: pointer;
  font-size: 1rem; padding: 4px; transition: color var(--transition);
}
.icon-btn:hover { color: var(--text); }
</style>
