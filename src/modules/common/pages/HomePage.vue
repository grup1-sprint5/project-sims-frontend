<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-900 text-white flex items-start justify-center py-12 px-4">
    <div class="w-full max-w-3xl">
      <h1 class="text-3xl font-bold text-center">Real-time Fleet Map</h1>
      <p class="text-center text-gray-400 mt-2">Track your vehicles in real time. Click the map to open the full interactive map.</p>

      <div class="mt-6 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-white/5">
        <div ref="miniMap" class="w-full h-96 cursor-pointer"></div>
      </div>

      <div class="mt-4 text-center">
        <button @click="openMap" class="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-500">Open full map</button>
      </div>

      <footer class="mt-6 text-center text-sm text-gray-500">Updated: 2026-02-09T15:57:38.759Z</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMap } from '@/modules/map/composables/useMap'

const router = useRouter()
const openMap = () => router.push('/vehicles-map')

const { map, mapContainer, initMap, destroyMap, fetchVehicles, addVehicleMarkers, rawVehicles } = useMap()
const miniMap = ref<HTMLElement | null>(null)
const nearbyAvailable = ref<any[]>([])

function computeDistancesAndFilter() {
  if (!map.value) return
  const center = map.value.getCenter()
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  nearbyAvailable.value = rawVehicles.value
    .map(v => {
      if (v.latitude == null || v.longitude == null) return null
      const dLat = toRad(v.latitude - center.lat)
      const dLon = toRad(v.longitude - center.lng)
      const lat1 = toRad(center.lat)
      const lat2 = toRad(v.latitude)
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c
      return { ...v, distanceMeters: d }
    })
    .filter(Boolean)
    .filter(v => !v.mongo_active) // available means postgres not occupied (based on icon logic)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 10)
}

onMounted(async () => {
  if (!miniMap.value) return
  mapContainer.value = miniMap.value
  initMap()
  try {
    await fetchVehicles('/vehicles-map')
    addVehicleMarkers()
    // compute after markers added
    setTimeout(() => computeDistancesAndFilter(), 400)
  } catch (e) {
    console.error(e)
  }
  if (map.value) {
    map.value.on('click', () => openMap())
    map.value.on('moveend', () => computeDistancesAndFilter())
  }
})

onUnmounted(() => destroyMap())
</script>

<style scoped>
[ref="miniMap"] { display: block; }
</style>
