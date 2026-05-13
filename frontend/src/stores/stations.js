import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useStationsStore = defineStore('stations', () => {
  const stations = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchStations(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.connectorType) params.connectorType = filters.connectorType
      if (filters.minPower) params.minPower = filters.minPower
      if (filters.maxPower) params.maxPower = filters.maxPower
      const { data } = await api.get('/stations', { params })
      stations.value = data.data
      return data
    } catch (e) {
      error.value = e.response?.data?.message || 'Failed to fetch stations'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createStation(payload) {
    const { data } = await api.post('/stations', payload)
    stations.value.unshift(data.data)
    return data.data
  }

  async function updateStation(id, payload) {
    const { data } = await api.put(`/stations/${id}`, payload)
    const idx = stations.value.findIndex(s => s._id === id)
    if (idx !== -1) stations.value[idx] = data.data
    return data.data
  }

  async function deleteStation(id) {
    await api.delete(`/stations/${id}`)
    stations.value = stations.value.filter(s => s._id !== id)
  }

  return { stations, loading, error, fetchStations, createStation, updateStation, deleteStation }
})
