import { ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import apiClient from '@/services/api'

export interface Vehicle {
  id: number
  plate: string
  brand: string
  model: string
  latitude: number
  longitude: number
  postgres_active?: boolean
  mongo_active?: boolean
  status: 'active' | 'inactive'
}

const vehicles = ref<Vehicle[]>([])
const map = ref<L.Map | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
const markers: Map<number, L.Marker> = new Map()
let userMarker: L.Marker | L.CircleMarker | null = null
let pollInterval: ReturnType<typeof setInterval> | null = null
let pollEndpoint = '/vehicles-map'

// reactive filters & search
const searchQuery = ref('')
const showOperativeOnly = ref(false)
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const radiusMeters = ref<number | null>(null)

const createVehicleIcon = (postgresActive?: boolean, mongoActive?: boolean) => {
  const color = postgresActive ? '#f59e0b' : '#22c55e'
  const borderColor = mongoActive ? '#ef4444' : '#ffffff'

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid ${borderColor};
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="18" height="18">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

const rawVehicles = ref<Vehicle[]>([])

const fetchVehicles = async (endpoint = '/vehicles-map') => {
  try {
    const response = await apiClient.get(endpoint)
    rawVehicles.value = response.data.map((v: any) => ({
      id: v.id,
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      latitude: v.latitude,
      longitude: v.longitude,
      postgres_active: v.postgres_active,
      mongo_active: v.mongo_active,
      status: (v.mongo_active === true) ? 'active' : 'inactive',
    }))

    applyFiltersAndMarkers()
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

const initMap = () => {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value).setView([41.3851, 2.1734], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value as any)

}

const withinRadius = (v: Vehicle) => {
  if (!userLocation.value || !radiusMeters.value) return true
  const R = 6371000 // metres
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(v.latitude - userLocation.value.lat)
  const dLon = toRad(v.longitude - userLocation.value.lng)
  const lat1 = toRad(userLocation.value.lat)
  const lat2 = toRad(v.latitude)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d <= (radiusMeters.value || 0)
}

const applyFiltersAndMarkers = () => {
  // apply search, operative filter and proximity
  const q = searchQuery.value.trim().toLowerCase()
  const filtered = rawVehicles.value.filter(v => {
    if (showOperativeOnly.value && !v.mongo_active) return false
    if (q) {
      const combined = `${v.plate} ${v.brand} ${v.model}`.toLowerCase()
      if (!combined.includes(q)) return false
    }
    if (!withinRadius(v)) return false
    return true
  })

  vehicles.value = filtered
  addVehicleMarkers()
}

const addVehicleMarkers = () => {
  if (!map.value) return

  const visibleIds = new Set<number>()

  vehicles.value.forEach(v => {
    if (v.latitude == null || v.longitude == null) return
    visibleIds.add(v.id)

    if (markers.has(v.id)) {
      // update existing marker position and icon
      const m = markers.get(v.id) as any
      try {
        m.setLatLng([v.latitude, v.longitude])
        m.setIcon(createVehicleIcon(v.postgres_active, v.mongo_active))
        // update popup content if present
        const popup = m.getPopup && m.getPopup()
        if (popup) {
          popup.setContent(`
            <div style="min-width:220px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#0f172a">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="display:flex;flex-direction:column">
                  <div style="font-weight:700;font-size:15px;color:#0f172a">${v.plate}</div>
                  <div style="font-size:12px;color:#6b7280">${v.brand} ${v.model}</div>
                </div>
                <div style="padding:4px 8px;border-radius:9999px;background:${v.mongo_active ? '#fee2e2' : '#ecfccb'};color:${v.mongo_active ? '#991b1b' : '#4d7c0f'};font-size:12px;font-weight:600">${v.mongo_active ? 'Running' : 'Idle'}</div>
              </div>

              <hr style="margin:8px 0;border-color:#e6eef8" />

              <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#0f172a">
                <div style="display:flex;justify-content:space-between"><span style="color:#334155">mec muc</span><strong style="color:#0f172a"> </strong></div>
                <div style="display:flex;justify-content:space-between"><span style="color:#334155">Disponibility</span><strong style="color:${v.postgres_active ? '#bf8700' : '#15803d'}">${v.postgres_active ? 'Occupied' : 'Available'}</strong></div>
              </div>
            </div>
          `)
        }
      } catch (e) { /* ignore */ }
    } else {
      const marker = L.marker([v.latitude, v.longitude], { icon: createVehicleIcon(v.postgres_active, v.mongo_active) })
        .addTo(map.value as any)
        .bindPopup(`
          <div style="min-width:220px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#0f172a">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div style="display:flex;flex-direction:column">
                <div style="font-weight:700;font-size:15px;color:#0f172a">${v.plate}</div>
                <div style="font-size:12px;color:#6b7280">${v.brand} ${v.model}</div>
              </div>
              <div style="padding:4px 8px;border-radius:9999px;background:${v.mongo_active ? '#fee2e2' : '#ecfccb'};color:${v.mongo_active ? '#991b1b' : '#4d7c0f'};font-size:12px;font-weight:600">${v.mongo_active ? 'Running' : 'Idle'}</div>
            </div>

            <hr style="margin:8px 0;border-color:#e6eef8" />

            <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#0f172a">
              <div style="display:flex;justify-content:space-between"><span style="color:#334155">mec muc</span><strong style="color:#0f172a"> </strong></div>
              <div style="display:flex;justify-content:space-between"><span style="color:#334155">Disponibility</span><strong style="color:${v.postgres_active ? '#bf8700' : '#15803d'}">${v.postgres_active ? 'Occupied' : 'Available'}</strong></div>
            </div>
          </div>
        `)

      markers.set(v.id, marker)
    }
  })

  // remove markers that are no longer present
  markers.forEach((m, id) => {
    if (!visibleIds.has(id)) {
      try { m.remove() } catch (e) {}
      markers.delete(id)
    }
  })

  if (vehicles.value.length > 0 && map.value) {
    if (!userLocation.value) {
      const bounds = L.latLngBounds(vehicles.value.map(v => [v.latitude, v.longitude]))
      map.value!.fitBounds(bounds, { padding: [50, 50] })
    }
  }
}

const centerOnVehicle = (vehicle: Vehicle) => {
  if (map.value) {
    map.value.setView([vehicle.latitude, vehicle.longitude], 15)
    const marker = markers.get(vehicle.id)
    if (marker) marker.openPopup()
  }
}

const setUserLocation = (lat: number, lng: number) => {
  userLocation.value = { lat, lng }
  // add or move user marker
  if (map.value) {
    if (userMarker) {
      // update existing marker
      try { userMarker.setLatLng([lat, lng]) } catch { /* ignore if circle */ }
    } else if (map.value) {
      // use a circle marker for user to ensure visible and distinct
      userMarker = L.circleMarker([lat, lng], { radius: 8, color: '#2563eb', weight: 2, fillColor: '#60a5fa', fillOpacity: 0.9 }).addTo(map.value as any)
      try { userMarker.bindPopup('<b>You are here</b>') } catch {}
    }
    // ensure user marker is on top
    if ((userMarker as any)?.bringToFront) (userMarker as any).bringToFront()
  }
  applyFiltersAndMarkers()
}

const destroyUserMarker = () => {
  if (userMarker) {
    userMarker.remove()
    userMarker = null
  }
}

const setRadiusMeters = (m: number | null) => {
  radiusMeters.value = m
  applyFiltersAndMarkers()
}

const setSearchQuery = (q: string) => {
  searchQuery.value = q
  applyFiltersAndMarkers()
}

const setShowOperativeOnly = (v: boolean) => {
  showOperativeOnly.value = v
  applyFiltersAndMarkers()
}

const destroyMap = () => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  markers.forEach(m => { try { m.remove() } catch {} })
  markers.clear()
}

export function useMap() {
  return {
    mapContainer,
    vehicles,
    map,
    markers,
    createVehicleIcon,
    fetchVehicles,
    initMap,
    addVehicleMarkers,
    centerOnVehicle,
    destroyMap,
    // new api
    rawVehicles,
    searchQuery,
    setSearchQuery,
    showOperativeOnly,
    setShowOperativeOnly,
    userLocation,
    setUserLocation,
    radiusMeters,
    setRadiusMeters,
    // expose user marker functions for diagnostics
    _internal: {
      getUserMarker: () => userMarker
    }
  }
}
