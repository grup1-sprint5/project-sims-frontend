<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-xs text-[var(--app-muted-text)]">
        {{ m.adminGeofenceFormUi.mapCircleHint }}
      </p>
      <button
        v-if="currentLayer"
        @click="clearZone"
        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        :title="m.commonUi.delete"
      >
        <span class="material-icons text-sm">clear</span>
        {{ m.adminGeofenceFormUi.remove }}
      </button>
    </div>
    <div ref="mapContainer" class="h-[420px] w-full rounded-lg border border-[var(--app-border)]"></div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useI18n } from '@/i18n'
import type { GeofencePoint, GeofenceType } from '../interfaces/geofencing.interface'

interface GeometryUpdate {
  polygonPoints: GeofencePoint[]
  center: { lat: number | null; lng: number | null }
  radius_m: number | null
}

const props = defineProps<{
  type: GeofenceType
  polygonPoints: GeofencePoint[]
  center: { lat: number | null; lng: number | null }
  radiusM: number | null
}>()

const emit = defineEmits<{
  (event: 'update:geometry', payload: GeometryUpdate): void
}>()

const { m } = useI18n()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let featureGroup: L.FeatureGroup | null = null
let drawButtonControl: L.Control | null = null
let currentLayer: L.Layer | null = null
let circleDrawer: any = null

const DRAW_CREATED_EVENT = 'draw:created'

const DEFAULT_CENTER: [number, number] = [41.3851, 2.1734]
const DEFAULT_ZOOM = 13

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

let drawPluginReady = false

const ensureLeafletDraw = async () => {
  if (drawPluginReady || (L.Control as any).Draw) {
    drawPluginReady = true
    return
  }

  ;(globalThis as { L?: typeof L }).L = L
  await import('leaflet-draw')
  drawPluginReady = Boolean((L.Control as any).Draw)
}

const removeCurrentLayer = () => {
  if (currentLayer instanceof L.Circle) {
    currentLayer.off('edit', emitGeometryFromLayer)
  }

  if (currentLayer && featureGroup) {
    featureGroup.removeLayer(currentLayer)
  }
  currentLayer = null
}

const buildClosedRing = (points: GeofencePoint[]) => {
  const finitePoints = points
    .filter((point) => isFiniteNumber(point.lat) && isFiniteNumber(point.lng))
    .map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) }))

  if (finitePoints.length === 0) return [] as GeofencePoint[]

  const first = finitePoints[0]
  const last = finitePoints[finitePoints.length - 1]

  if (!first || !last) return [] as GeofencePoint[]

  if (first.lat !== last.lat || first.lng !== last.lng) {
    finitePoints.push({ lat: first.lat, lng: first.lng })
  }

  return finitePoints
}

const emitEmptyGeometry = () => {
  emit('update:geometry', {
    polygonPoints: [],
    center: { lat: null, lng: null },
    radius_m: null,
  })
}

const emitGeometryFromLayer = () => {
  if (!currentLayer) {
    emitEmptyGeometry()
    return
  }

  if (currentLayer instanceof L.Circle) {
    const center = currentLayer.getLatLng()
    emit('update:geometry', {
      polygonPoints: [],
      center: {
        lat: Number(center.lat.toFixed(6)),
        lng: Number(center.lng.toFixed(6)),
      },
      radius_m: Math.round(currentLayer.getRadius()),
    })
    return
  }

  if (currentLayer instanceof L.Polygon) {
    const latLngGroups = currentLayer.getLatLngs() as L.LatLng[][]
    const ring = latLngGroups[0] ?? []
    const polygonPoints = buildClosedRing(
      ring.map((point) => ({
        lat: Number(point.lat.toFixed(6)),
        lng: Number(point.lng.toFixed(6)),
      })),
    )

    emit('update:geometry', {
      polygonPoints,
      center: { lat: null, lng: null },
      radius_m: null,
    })
    return
  }

  emitEmptyGeometry()
}

const enableCircleEditing = (layer: L.Circle) => {
  const editable = (layer as any).editing
  if (editable?.enable) {
    editable.enable()
  }
  layer.on('edit', emitGeometryFromLayer)
}

const fitLayer = (layer: L.Layer) => {
  if (!map) return

  if (layer instanceof L.Circle) {
    map.fitBounds(layer.getBounds(), { padding: [24, 24] })
    return
  }

  if (layer instanceof L.Polygon) {
    map.fitBounds(layer.getBounds(), { padding: [24, 24] })
  }
}

const syncLayerFromProps = () => {
  if (!featureGroup || !map) return

  removeCurrentLayer()

  if (
    isFiniteNumber(props.center.lat) &&
    isFiniteNumber(props.center.lng) &&
    isFiniteNumber(props.radiusM) &&
    props.radiusM > 0
  ) {
    currentLayer = L.circle([props.center.lat, props.center.lng], {
      radius: props.radiusM,
      color: '#4f46e5',
      fillOpacity: 0.2,
    })
    featureGroup.addLayer(currentLayer)
    if (currentLayer instanceof L.Circle) {
      enableCircleEditing(currentLayer)
    }
    fitLayer(currentLayer)
    return
  }

  map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
}

const handleCreated = (event: any) => {
  if (!featureGroup) return

  removeCurrentLayer()
  currentLayer = event.layer
  if (currentLayer) {
    featureGroup.addLayer(currentLayer)
    if (currentLayer instanceof L.Circle) {
      enableCircleEditing(currentLayer)
    }
  }
  emitGeometryFromLayer()
}

const startCircleDrawing = () => {
  if (!map) return

  const CircleDrawer = (L.Draw as any)?.Circle
  if (!CircleDrawer) return

  if (circleDrawer?.disable) {
    circleDrawer.disable()
  }

  circleDrawer = new CircleDrawer(map, {
    shapeOptions: {
      color: '#4f46e5',
      fillOpacity: 0.2,
    },
    showRadius: true,
  })

  circleDrawer.enable()
}

const addCircleDrawButton = () => {
  if (!map) return

  const CircleDrawButtonControl = L.Control.extend({
    onAdd: () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const button = L.DomUtil.create('a', '', container)

      button.href = '#'
      button.title = m.value.adminGeofenceFormUi.typeCircle
      button.innerHTML = '◯'
      button.setAttribute('role', 'button')
      button.setAttribute('aria-label', m.value.adminGeofenceFormUi.typeCircle)
      button.style.fontSize = '18px'
      button.style.fontWeight = '700'
      button.style.lineHeight = '30px'
      button.style.textAlign = 'center'
      button.style.color = '#1f2937'

      L.DomEvent.disableClickPropagation(container)
      L.DomEvent.on(button, 'click', (event: Event) => {
        L.DomEvent.stop(event)
        startCircleDrawing()
      })

      return container
    },
  })

  drawButtonControl = new CircleDrawButtonControl({ position: 'topleft' })
  map.addControl(drawButtonControl)
}

const clearZone = () => {
  if (!featureGroup) return

  featureGroup.clearLayers()
  currentLayer = null
  emit('update:geometry', { center: { lat: 0, lng: 0 }, radius_m: 0, polygonPoints: [] })
}

onMounted(async () => {
  if (!mapContainer.value) return

  await ensureLeafletDraw()

  map = L.map(mapContainer.value).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  featureGroup = new L.FeatureGroup()
  map.addLayer(featureGroup)

  map.on(DRAW_CREATED_EVENT, handleCreated)
  addCircleDrawButton()
  syncLayerFromProps()

  await nextTick()
  map.invalidateSize()
})

onBeforeUnmount(() => {
  if (!map) return

  map.off(DRAW_CREATED_EVENT, handleCreated)

  if (drawButtonControl) {
    map.removeControl(drawButtonControl)
  }

  if (circleDrawer?.disable) {
    circleDrawer.disable()
  }

  map.remove()

  map = null
  featureGroup = null
  drawButtonControl = null
  circleDrawer = null
  currentLayer = null
})

watch(
  () => [props.polygonPoints, props.center.lat, props.center.lng, props.radiusM],
  () => {
    syncLayerFromProps()
  },
  { deep: true },
)
</script>

<style scoped>
:deep(.leaflet-editing-icon),
:deep(.leaflet-div-icon.leaflet-editing-icon),
:deep(.leaflet-marker-icon.leaflet-editing-icon),
:deep(.leaflet-edit-move),
:deep(.leaflet-edit-resize),
:deep(.leaflet-touch-icon),
:deep(.leaflet-draw-marker),
:deep(.leaflet-draw-vertex-marker),
:deep(.leaflet-draw-middle-marker),
:deep(.leaflet-draw-resize-marker),
:deep(.leaflet-draw-resize-marker-center),
:deep(.leaflet-marker-icon.leaflet-draw-marker-draggable) {
  display: none !important;
}
</style>
