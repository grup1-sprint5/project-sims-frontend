<template>
  <!-- Contenedor principal del mapa -->
  <div class="relative min-h-[100dvh] bg-gray-800">
    <div ref="mapContainer" class="absolute inset-0" style="height: calc(100vh - 4rem);"></div>
    
    <!-- Panel lateral esquerre amb detalls del vehicle -->
    <Transition name="slide-left">
      <div v-if="showSelectedPanel" class="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-xl z-[9999] overflow-y-auto">
        <div class="p-4">
          <!-- Header amb botó tancar -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Details del Vehicle</h2>
            <button @click="closeSelectedPanel" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedVehicle" class="space-y-3">
            <!-- Matrícula -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Matrícula</label>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedVehicle.plate }}</p>
            </div>

            <!-- Marca/Model -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Marca/Model</label>
              <p class="text-base text-gray-900 dark:text-white">{{ selectedVehicle.brand }} {{ selectedVehicle.model }}</p>
            </div>

            <!-- ID -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">ID</label>
              <p class="text-base text-gray-900 dark:text-white">#{{ selectedVehicle.id }}</p>
            </div>

            <!-- Estat -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estat</label>
              <span 
                class="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                :class="{
                  'bg-green-100 text-green-800': selectedVehicle.status === 'available',
                  'bg-orange-100 text-orange-800': selectedVehicle.status === 'occupied',
                  'bg-red-100 text-red-800': selectedVehicle.status === 'running'
                }"
              >
                {{ selectedVehicle.status === 'available' ? 'Disponible' : (selectedVehicle.status === 'occupied' ? 'Ocupat' : 'En Marxa') }}
              </span>
            </div>

            <!-- Actiu -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Actiu</label>
              <span 
                class="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                :class="selectedVehicle.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ selectedVehicle.active ? 'Sí' : 'No' }}
              </span>
            </div>

            <!-- Ubicació -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ubicació</label>
              <p class="text-xs text-gray-900 dark:text-white font-mono">
                {{ selectedVehicle.latitude?.toFixed(6) }}, {{ selectedVehicle.longitude?.toFixed(6) }}
              </p>
            </div>

            <!-- Data de creació -->
            <div v-if="selectedVehicle.created_at">
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Data de creació</label>
              <p class="text-base text-gray-900 dark:text-white">{{ formatDate(selectedVehicle.created_at) }}</p>
            </div>

            <!-- Última actualització -->
            <div v-if="selectedVehicle.updated_at">
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Última actualització</label>
              <p class="text-base text-gray-900 dark:text-white">{{ formatDate(selectedVehicle.updated_at) }}</p>
            </div>

            <!-- Tenant ID -->
            <div v-if="selectedVehicle.tenant_id">
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tenant ID</label>
              <p class="text-base text-gray-900 dark:text-white">#{{ selectedVehicle.tenant_id }}</p>
            </div>

            <!-- Botó Reserva ara (sempre visible, disabled si no disponible) -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <BookingButton 
                :vehicle-id="selectedVehicle.id"
                :disabled="selectedVehicle.status !== 'available'"
                :label="selectedVehicle.status === 'available' ? 'Reserva ara!' : 'No disponible'"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="map-controls absolute top-4 right-4 lg:right-20 bg-white/95 dark:bg-gray-900/95 text-sm p-4 rounded-lg shadow w-80 backdrop-blur">

      <details class="map-legend-details bg-transparent">
        <summary class="font-semibold mb-1 cursor-pointer">Legend ▾</summary>
        <div class="mt-2 space-y-2">
          <div class="flex items-center gap-2"><span style="width:14px;height:14px;border-radius:50%;background:#22c55e;display:inline-block;border:2px solid #ffffff"></span><span>Available</span></div>
          <div class="flex items-center gap-2"><span style="width:14px;height:14px;border-radius:50%;background:#f59e0b;display:inline-block;border:2px solid #ffffff"></span><span>Occupied</span></div>
          <div class="flex items-center gap-2"><span style="width:14px;height:14px;border-radius:50%;background:#ffffff;display:inline-block;border:3px solid #ef4444"></span><span>Running</span></div>
        </div>
      </details>

      <details class="map-legend-details bg-transparent mt-3 rounded border border-white/5 shadow-sm">
        <summary class="flex items-center justify-between font-semibold mb-1 cursor-pointer px-2 py-1">
          <span>Nearby vehicles</span>
          <span class="text-xs text-gray-400">≤ 2 km</span>
        </summary>
        <div class="mt-2 px-1 py-1">
          <div v-if="nearbyAvailable.length === 0" class="text-sm text-gray-400">No nearby vehicles found.</div>
          <ul v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <li v-for="v in nearbyAvailable.slice(0,6)" :key="v.id" class="flex items-center justify-between gap-3 p-1 rounded-md hover:bg-white/6 transition-colors" @click="onNearbyClick(v)">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-8 h-8 rounded-full" :style="{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }">
                  <span :style="{ width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', background: v.status === 'running' ? '#ef4444' : (v.status === 'occupied' ? '#f59e0b' : '#22c55e'), border: '2px solid #fff' }"></span>
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium truncate">{{ v.plate }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ v.brand }} {{ v.model }}</div>
                </div>
              </div>
              <div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-indigo-200">{{ v.distanceMeters < 1000 ? `${Math.round(v.distanceMeters)} m` : `${(v.distanceMeters/1000).toFixed(2)} km` }}</div>
                  <div class="text-xs text-gray-400">{{ v.status === 'running' ? 'Running' : (v.status === 'occupied' ? 'Occupied' : 'Available') }}</div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </details>
    </div>

    <!-- Floating locate button -->
    <button @click="locateMe" aria-label="Go to my location" class="fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700">📍</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMap } from '@/modules/map/composables/useMap'
import BookingButton from '@/modules/common/components/BookingButton.vue'

const route = useRoute()
const router = useRouter()
const { mapContainer, map, vehicles, markers, initMap, fetchVehicles, setUserLocation, destroyMap, rawVehicles, userLocation, _internal, centerOnVehicle, setOnVehicleClick, setSelectedVehicle } = useMap()
let userMarker: any = null

const nearbyAvailable = ref<any[]>([])
const selectedVehicle = ref<any | null>(null)
const showSelectedPanel = ref(false)

const refresh = () => fetchVehicles('/vehicles')

const goToBookings = () => {
  router.push('/bookings')
}

const locateMe = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude
    setUserLocation(lat, lng)
    if (map.value) {
      map.value.setView([lat, lng], 13)
      // user marker handled by setUserLocation
      setUserLocation(lat, lng)
      userMarker?.openPopup()
    }
  }, err => console.warn('Geolocation failed', err))
}

function computeNearbyAvailable() {
  if (!map.value) return
  // prefer user's location if available, fallback to map center
  const centerPoint = (userLocation.value && userLocation.value.lat && userLocation.value.lng)
    ? { lat: userLocation.value.lat, lng: userLocation.value.lng }
    : map.value.getCenter()
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  nearbyAvailable.value = rawVehicles.value
    .map(v => {
      if (v.latitude == null || v.longitude == null) return null
      const dLat = toRad(v.latitude - centerPoint.lat)
      const dLon = toRad(v.longitude - centerPoint.lng)
      const lat1 = toRad(centerPoint.lat)
      const lat2 = toRad(v.latitude)
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c
      return { ...v, distanceMeters: d }
    })
    .filter(Boolean)
    .filter(v => v.distanceMeters <= 2000) // Mostra tots els vehicles dins de 2km
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 10)
}

onMounted(() => {
  initMap()
  
  // Registrar el callback per quan es clica un vehicle
  setOnVehicleClick((vehicle) => {
    selectedVehicle.value = vehicle
    showSelectedPanel.value = true
    setSelectedVehicle(vehicle.id)
  })
  
  const view = route.query.view?.toString()

  // Always ask for geolocation when entering the vehicles map to center on user
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation(lat, lng)
        if (map.value) {
          map.value.setView([lat, lng], 15)
        }
        fetchVehicles('/vehicles').catch(err => console.error(err))
        // try to grab userMarker via exposed internal function
        try { userMarker = _internal?.getUserMarker?.() ?? null } catch { userMarker = null }
        // compute nearby from user location
        setTimeout(() => computeNearbyAvailable(), 400)
      },
      (err) => {
        console.warn('Geolocation failed or denied', err)
        // fallback: centrar a Amposta i carregar vehicles
        if (map.value) {
          map.value.setView([40.7095, 0.5795], 13)
        }
        fetchVehicles('/vehicles').catch(err => console.error(err))
        setTimeout(() => computeNearbyAvailable(), 600)
      },
      { enableHighAccuracy: true }
    )
  } else {
    // if geolocation not available, fallback: centrar a Amposta
    if (map.value) {
      map.value.setView([40.7095, 0.5795], 13)
    }
    fetchVehicles('/vehicles').catch(err => console.error(err))
    setTimeout(() => computeNearbyAvailable(), 600)
  }

  // compute when map moves
  if (map.value) {
    map.value.on('moveend', () => computeNearbyAvailable())
  }
})

function onNearbyClick(v: any) {
  selectedVehicle.value = v
  showSelectedPanel.value = true
  setSelectedVehicle(v.id)
  centerOnVehicle(v)
}

function closeSelectedPanel() {
  showSelectedPanel.value = false
  selectedVehicle.value = null
  setSelectedVehicle(null)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('ca-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onUnmounted(() => {
  destroyMap()
})
</script>

<style>
.vehicle-marker {
  background: transparent !important;
  border: none !important;
}

/* Custom cluster styles */
.marker-cluster {
  background-clip: padding-box;
  border-radius: 50%;
  cursor: pointer;
}

.marker-cluster div {
  width: 40px;
  height: 40px;
  margin-left: 0;
  margin-top: 0;
  text-align: center;
  border-radius: 50%;
  font: 14px "Helvetica Neue", Arial, Helvetica, sans-serif;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.marker-cluster:hover div {
  transform: scale(1.1);
}

.marker-cluster span {
  line-height: 40px;
  color: white;
  font-weight: 700;
  font-size: 15px;
}

/* Small clusters: 1-4 vehicles (green) */
.marker-cluster-small {
  background-color: rgba(34, 197, 94, 0.4);
}
.marker-cluster-small div {
  background-color: rgba(34, 197, 94, 0.9);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid white;
}

/* Medium clusters: 5-9 vehicles (orange) */
.marker-cluster-medium {
  background-color: rgba(245, 158, 11, 0.4);
}
.marker-cluster-medium div {
  background-color: rgba(245, 158, 11, 0.9);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid white;
}

/* Large clusters: 10+ vehicles (red) */
.marker-cluster-large {
  background-color: rgba(239, 68, 68, 0.4);
}
.marker-cluster-large div {
  background-color: rgba(239, 68, 68, 0.9);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid white;
}

/* Ensure Leaflet map and all its panes stay below the app sidebar */
.leaflet-container,
.leaflet-control-container,
.leaflet-map-pane,
.leaflet-pane,
.leaflet-overlay-pane,
.leaflet-tile-pane,
.leaflet-shadow-pane {
  z-index: 0 !important;
}
/* Legend styling */
.map-legend { z-index: 10001; }
/* Allow sidebar and menus to receive pointer events above the map */
.admin-sidebar,
.app-sidebar,
.fixed-sidebar {
  z-index: 9999 !important;
  position: relative;
}

/* compact legend / nearby list tweaks */
.map-controls .map-legend-details {
  width: 18rem;
  font-size: 0.875rem;
}
.map-controls .map-legend-details summary { padding: 0 }
.map-controls .map-legend-details ul { padding: 0 }
.map-controls .map-legend-details li { padding: 0 }

/* selected panel and transition */
.selected-vehicle-panel { max-width: 18rem; }
.slide-fade-enter-active { transition: all .2s ease; }
.slide-fade-leave-active { transition: all .15s ease; }
.slide-fade-enter-from { transform: translateY(8px); opacity: 0; }
.slide-fade-enter-to { transform: translateY(0); opacity: 1; }
.slide-fade-leave-from { transform: translateY(0); opacity: 1; }
.slide-fade-leave-to { transform: translateY(8px); opacity: 0; }

/* Slide left transition for vehicle details panel */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}
.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
