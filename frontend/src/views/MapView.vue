<template>
  <AppLayout>
    <div class="map-page">
      <!-- Header bar -->
      <div class="map-header">
        <div>
          <h2 class="page-title">Map View</h2>
          <p class="page-subtitle">{{ store.stations.length }} stations plotted</p>
        </div>
        <div class="header-filters">
          <select v-model="filterStatus" class="select" style="width:130px" @change="filterMarkers">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select v-model="filterConnector" class="select" style="width:150px" @change="filterMarkers">
            <option value="">All Connectors</option>
            <option v-for="c in connectors" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <!-- Map container -->
      <div class="map-container">
        <div id="leaflet-map" ref="mapEl"></div>

        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-item"><span class="dot active"></span>Active</div>
          <div class="legend-item"><span class="dot inactive"></span>Inactive</div>
        </div>

        <!-- Stats overlay -->
        <div class="map-stats">
          <div class="stat-chip">
            <span class="stat-val">{{ visibleCount }}</span>
            <span class="stat-label">Visible</span>
          </div>
          <div class="stat-chip">
            <span class="stat-val">{{ activeVisibleCount }}</span>
            <span class="stat-label">Active</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useStationsStore } from '../stores/stations'

const store = useStationsStore()
const mapEl = ref(null)
let map = null
let markersLayer = null

const filterStatus    = ref('')
const filterConnector = ref('')
const connectors = ['CCS', 'CHAdeMO', 'Type 2', 'Type 1', 'GB/T', 'Tesla']

const filteredStations = computed(() => {
  return store.stations.filter(s => {
    if (filterStatus.value && s.status !== filterStatus.value) return false
    if (filterConnector.value && s.connectorType !== filterConnector.value) return false
    return true
  })
})

const visibleCount = computed(() => filteredStations.value.length)
const activeVisibleCount = computed(() => filteredStations.value.filter(s => s.status === 'Active').length)

function filterMarkers() {
  if (!map) return
  renderMarkers()
}

function renderMarkers() {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()

  filteredStations.value.forEach(station => {
    const isActive = station.status === 'Active'
    const color    = isActive ? '#00e5a0' : '#ff4f5e'

    const icon = window.L.divIcon({
      className: '',
      html: `
        <div style="
          width:30px; height:30px; border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${color}; border:2px solid ${isActive ? '#00b87a' : '#cc3d4a'};
          box-shadow: 0 2px 12px ${color}60;
          display:flex; align-items:center; justify-content:center;
        ">
          <span style="transform:rotate(45deg); font-size:12px">⚡</span>
        </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -32]
    })

    const marker = window.L.marker(
      [station.location.latitude, station.location.longitude],
      { icon }
    )

    marker.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif; min-width:200px; padding:4px">
        <div style="font-weight:700; font-size:0.95rem; margin-bottom:8px; color:#e8eaf0">${station.name}</div>
        ${station.location.address ? `<div style="color:#8b90a0; font-size:0.8rem; margin-bottom:10px">${station.location.address}</div>` : ''}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px">
          <div style="background:#1a1d25; border-radius:6px; padding:8px; text-align:center">
            <div style="font-size:1.1rem; font-weight:700; color:${color}">${station.powerOutput}</div>
            <div style="font-size:0.7rem; color:#555a68; text-transform:uppercase; letter-spacing:0.05em">kW</div>
          </div>
          <div style="background:#1a1d25; border-radius:6px; padding:8px; text-align:center">
            <div style="font-size:0.8rem; font-weight:600; color:#4fa3ff">${station.connectorType}</div>
            <div style="font-size:0.7rem; color:#555a68; text-transform:uppercase; letter-spacing:0.05em">Type</div>
          </div>
        </div>
        <div style="margin-top:8px; display:inline-flex; align-items:center; gap:5px;
          padding:3px 9px; border-radius:99px; font-size:0.72rem; font-weight:600;
          background:${color}18; color:${color}; border:1px solid ${color}30">
          <span style="width:5px;height:5px;border-radius:50%;background:currentColor;display:inline-block"></span>
          ${station.status}
        </div>
        <div style="margin-top:8px; font-size:0.72rem; color:#555a68; font-family:'Space Mono',monospace">
          ${station.location.latitude.toFixed(5)}, ${station.location.longitude.toFixed(5)}
        </div>
      </div>
    `, { maxWidth: 280 })

    markersLayer.addLayer(marker)
  })

  // Fit bounds if stations exist
  if (filteredStations.value.length > 0 && markersLayer.getLayers().length > 0) {
    try { map.fitBounds(markersLayer.getBounds(), { padding: [40, 40], maxZoom: 13 }) }
    catch(e) {}
  }
}

async function initMap() {
  // Load leaflet dynamically
  if (!window.L) {
    await import('leaflet')
  }

  map = window.L.map(mapEl.value, {
    center: [20.5937, 78.9629], // India default center
    zoom: 5,
    zoomControl: false
  })

  // Dark tile layer from CartoDB
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  // Zoom control bottom right
  window.L.control.zoom({ position: 'bottomright' }).addTo(map)

  markersLayer = window.L.layerGroup().addTo(map)
  renderMarkers()
}

onMounted(async () => {
  if (!store.stations.length) {
    await store.fetchStations()
  }
  await initMap()
})

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})

watch(() => store.stations, () => {
  if (map) renderMarkers()
}, { deep: true })
</script>

<style scoped>
.map-page { display: flex; flex-direction: column; height: 100vh; }
.map-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.page-title { font-size: 1.3rem; font-family: var(--font-mono); }
.page-subtitle { color: var(--text2); font-size: 0.82rem; }
.header-filters { display: flex; gap: 10px; }

.map-container { flex: 1; position: relative; overflow: hidden; }
#leaflet-map { width: 100%; height: 100%; }

.map-legend {
  position: absolute; bottom: 30px; left: 16px; z-index: 900;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: 10px 14px;
  display: flex; flex-direction: column; gap: 6px;
}
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text2); }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.active { background: #00e5a0; box-shadow: 0 0 6px #00e5a060; }
.dot.inactive { background: #ff4f5e; box-shadow: 0 0 6px #ff4f5e60; }

.map-stats {
  position: absolute; top: 16px; left: 16px; z-index: 900;
  display: flex; gap: 8px;
}
.stat-chip {
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: 8px 14px;
  display: flex; flex-direction: column; align-items: center;
}
.stat-val { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--accent); line-height: 1; }
.stat-label { font-size: 0.68rem; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
</style>
