<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-xs text-[var(--app-muted-text)]">
        {{ props.type === 'polygon' ? m.adminGeofenceFormUi.mapPolygonHint : m.adminGeofenceFormUi.mapCircleHint }}
      </p>
      <button
        v-if="currentLayer"
        type="button"
        @click="clearZone"
        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        :title="m.commonUi.delete"
      >
        <span class="material-icons text-sm" aria-hidden="true">clear</span>
        {{ m.adminGeofenceFormUi.remove }}
      </button>
    </div>
    <div ref="mapContainer" class="h-[420px] w-full rounded-lg border border-[var(--app-border)]"></div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
const currentLayer = shallowRef<L.Layer | null>(null)
let circleDrawer: any = null
let polygonDrawer: any = null

const DRAW_CREATED_EVENT = 'draw:created'

const DEFAULT_CENTER: [number, number] = [41.3851, 2.1734]
const DEFAULT_ZOOM = 13

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const leafletDraw = L as typeof L & { Draw?: Record<string, any> }

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
  if (currentLayer.value instanceof L.Circle || currentLayer.value instanceof L.Polygon) {
    currentLayer.value.off('edit', emitGeometryFromLayer)
  }

  if (currentLayer.value && featureGroup) {
    featureGroup.removeLayer(currentLayer.value)
  }
  currentLayer.value = null
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
  const layer = currentLayer.value
  if (!layer) {
    emitEmptyGeometry()
    return
  }

  if (layer instanceof L.Circle) {
    const center = layer.getLatLng()
    emit('update:geometry', {
      polygonPoints: [],
      center: {
        lat: Number(center.lat.toFixed(6)),
        lng: Number(center.lng.toFixed(6)),
      },
      radius_m: Math.round(layer.getRadius()),
    })
    return
  }

  if (layer instanceof L.Polygon) {
    const latLngGroups = layer.getLatLngs() as L.LatLng[][]
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
  enableLayerEditing(layer)
}

const enablePolygonEditing = (layer: L.Polygon) => {
  enableLayerEditing(layer)
}

const enableLayerEditing = (layer: L.Circle | L.Polygon) => {
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

  if (props.type === 'polygon') {
    const polygonPoints = buildClosedRing(props.polygonPoints)
    if (polygonPoints.length >= 4) {
      const leafletPoints = polygonPoints.slice(0, -1).map((point) => [point.lat, point.lng] as [number, number])
      currentLayer.value = L.polygon(leafletPoints, {
        color: '#4f46e5',
        fillOpacity: 0.2,
      })
      featureGroup.addLayer(currentLayer.value)
      if (currentLayer.value instanceof L.Polygon) {
        enablePolygonEditing(currentLayer.value)
      }
      fitLayer(currentLayer.value)
      return
    }

    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    return
  }

  if (
    isFiniteNumber(props.center.lat) &&
    isFiniteNumber(props.center.lng) &&
    isFiniteNumber(props.radiusM) &&
    props.radiusM > 0
  ) {
    currentLayer.value = L.circle([props.center.lat, props.center.lng], {
      radius: props.radiusM,
      color: '#4f46e5',
      fillOpacity: 0.2,
    })
    featureGroup.addLayer(currentLayer.value)
    if (currentLayer.value instanceof L.Circle) {
      enableCircleEditing(currentLayer.value)
    }
    fitLayer(currentLayer.value)
    return
  }

  map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
}

const handleCreated = (event: any) => {
  if (!featureGroup) return

  if (
    (props.type === 'circle' && !(event.layer instanceof L.Circle)) ||
    (props.type === 'polygon' && !(event.layer instanceof L.Polygon))
  ) {
    return
  }

  removeCurrentLayer()
  currentLayer.value = event.layer
  if (currentLayer.value) {
    featureGroup.addLayer(currentLayer.value)
    if (currentLayer.value instanceof L.Circle) {
      enableCircleEditing(currentLayer.value)
    }
    if (currentLayer.value instanceof L.Polygon) {
      enablePolygonEditing(currentLayer.value)
    }
  }
  emitGeometryFromLayer()
}

const startCircleDrawing = () => {
  if (!map) return

  const CircleDrawer = leafletDraw.Draw?.Circle
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

const startPolygonDrawing = () => {
  if (!map) return

  const PolygonDrawer = leafletDraw.Draw?.Polygon
  if (!PolygonDrawer) return

  if (polygonDrawer?.disable) {
    polygonDrawer.disable()
  }

  polygonDrawer = new PolygonDrawer(map, {
    allowIntersection: false,
    shapeOptions: {
      color: '#4f46e5',
      fillOpacity: 0.2,
    },
  })

  polygonDrawer.enable()
}

const startDrawingForType = () => {
  if (props.type === 'polygon') {
    startPolygonDrawing()
    return
  }

  startCircleDrawing()
}

const addDrawButton = () => {
  if (!map) return

  const DrawButtonControl = L.Control.extend({
    onAdd: () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const button = L.DomUtil.create('a', '', container)

      button.href = '#'
      button.title = props.type === 'polygon' ? m.value.adminGeofenceFormUi.typePolygon : m.value.adminGeofenceFormUi.typeCircle
      button.innerHTML = props.type === 'polygon' ? '▱' : '◯'
      button.setAttribute('role', 'button')
      button.setAttribute('aria-label', button.title)
      button.style.fontSize = '18px'
      button.style.fontWeight = '700'
      button.style.lineHeight = '30px'
      button.style.textAlign = 'center'
      button.style.color = '#1f2937'

      L.DomEvent.disableClickPropagation(container)
      L.DomEvent.on(button, 'click', (event: Event) => {
        L.DomEvent.stop(event)
        startDrawingForType()
      })

      return container
    },
  })

  drawButtonControl = new DrawButtonControl({ position: 'topleft' })
  map.addControl(drawButtonControl)
}

const clearZone = () => {
  if (!featureGroup) return

  featureGroup.clearLayers()
  currentLayer.value = null
  emitEmptyGeometry()
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
  addDrawButton()
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

  if (polygonDrawer?.disable) {
    polygonDrawer.disable()
  }

  map.remove()

  map = null
  featureGroup = null
  drawButtonControl = null
  circleDrawer = null
  polygonDrawer = null
  currentLayer.value = null
})

watch(
  () => [props.type, props.polygonPoints, props.center.lat, props.center.lng, props.radiusM],
  () => {
    if (drawButtonControl && map) {
      map.removeControl(drawButtonControl)
      drawButtonControl = null
      addDrawButton()
    }
    syncLayerFromProps()
  },
  { deep: true },
)
</script>
