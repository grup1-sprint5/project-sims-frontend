<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex items-center justify-between">
      <router-link to="/admin/geofences" class="text-sm text-indigo-500 hover:text-indigo-700">← {{ m.adminGeofenceDetailUi.back }}</router-link>
      <router-link :to="`/admin/geofences/${id}/edit`" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">{{ m.commonUi.edit }}</router-link>
    </div>

    <div v-if="loading" class="text-sm text-[var(--app-muted-text)]">{{ m.adminGeofenceDetailUi.loading }}</div>
    <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div v-else-if="geofence" class="space-y-6">
      <section class="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6">
        <h1 class="text-xl font-semibold">{{ geofence.name }}</h1>
        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p class="text-[var(--app-muted-text)]">{{ m.adminGeofencesUi.colType }}</p>
            <p class="font-medium uppercase">{{ geofence.type }}</p>
          </div>
          <div>
            <p class="text-[var(--app-muted-text)]">{{ m.adminGeofencesUi.colRule }}</p>
            <p class="font-medium uppercase">{{ geofence.rule_type }}</p>
          </div>
          <div>
            <p class="text-[var(--app-muted-text)]">{{ m.commonUi.status }}</p>
            <StatusBadge :active="geofence.active" :active-text="m.adminGeofencesUi.active" :inactive-text="m.adminGeofencesUi.inactive" />
          </div>
          <div>
            <p class="text-[var(--app-muted-text)]">{{ m.adminGeofenceFormUi.hysteresis }}</p>
            <p class="font-medium">{{ geofence.hysteresis_m ?? 0 }} m</p>
          </div>
        </div>

        <div v-if="geofence.schedule" class="mt-4 rounded-md border border-[var(--app-border)] p-3 text-sm">
          <p class="font-medium">{{ m.adminGeofenceFormUi.schedule }}</p>
          <p class="text-[var(--app-muted-text)]">{{ geofence.schedule.timezone }} · {{ geofence.schedule.days.join(', ') }} · {{ geofence.schedule.start }} - {{ geofence.schedule.end }}</p>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6">
        <h2 class="text-lg font-semibold">{{ m.adminGeofenceDetailUi.assignments }}</h2>

        <form class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto]" @submit.prevent="handleCreateAssignment">
          <FormSelect v-model="assignmentForm.assign_type">
            <option v-for="option in assignTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </FormSelect>

          <template v-if="assignmentForm.assign_type === 'vehicle'">
            <FormSelect v-model="assignmentForm.assign_id">
              <option v-for="option in vehicleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </FormSelect>
          </template>
          <template v-else>
            <FormInput v-model="assignmentForm.assign_id" type="text" :placeholder="m.adminGeofenceDetailUi.fleetId" />
          </template>

          <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500" :disabled="saving">
            {{ m.adminGeofenceDetailUi.assign }}
          </button>
        </form>

        <p v-if="assignmentError" class="mt-2 text-xs text-red-500">{{ assignmentError }}</p>

        <AdminsTable class="mt-4" :columns="assignmentColumns" :empty="assignments.length === 0">
          <template #empty>{{ m.adminGeofenceDetailUi.noAssignments }}</template>

          <tr v-for="assignment in assignments" :key="assignment.id">
            <AdminTd first variant="muted">{{ assignment.id }}</AdminTd>
            <AdminTd variant="muted" class="uppercase">{{ assignment.assign_type }}</AdminTd>
            <AdminTd variant="primary">{{ assignment.assign_id }}</AdminTd>
            <AdminTd variant="actions">
              <button
                type="button"
                class="inline-flex items-center text-red-500 hover:text-red-700"
                :title="m.adminGeofenceFormUi.remove"
                @click="handleDeleteAssignment(assignment.id)"
              >
                <TrashIcon class="size-4" aria-hidden="true" />
                <span class="sr-only">{{ m.adminGeofenceFormUi.remove }}</span>
              </button>
            </AdminTd>
          </tr>
        </AdminsTable>
      </section>

      <section class="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6">
        <h2 class="text-lg font-semibold">{{ m.adminGeofenceDetailUi.mapPreview }}</h2>
        <div ref="mapContainer" class="mt-4 h-72 w-full rounded-lg border border-[var(--app-border)]"></div>
      </section>

      <section class="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ m.adminGeofenceDetailUi.recentEvents }}</h2>
          <router-link :to="`/admin/geofence-events?geofence_id=${geofence.id}`" class="text-sm text-indigo-500 hover:text-indigo-700">{{ m.adminGeofenceDetailUi.openFullList }}</router-link>
        </div>

        <AdminsTable :columns="eventColumns" :empty="events.length === 0">
          <template #empty>{{ m.adminGeofenceDetailUi.noEvents }}</template>
          <tr v-for="event in events" :key="event.id">
            <AdminTd first variant="muted">{{ event.id }}</AdminTd>
            <AdminTd variant="muted">{{ event.vehicle_id }}</AdminTd>
            <AdminTd variant="muted">
              <GeofenceEventBadge :event-type="event.event_type" />
            </AdminTd>
            <AdminTd variant="muted">{{ event.position.lat }}, {{ event.position.lng }}</AdminTd>
            <AdminTd variant="muted">{{ new Date(event.occurred_at).toLocaleString() }}</AdminTd>
          </tr>
        </AdminsTable>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FormField from '@/modules/admin/components/FormField.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormSelect from '@/modules/admin/components/FormSelect.vue'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useVehicles } from '@/modules/admin/modules/vehicles/composables/useVehicles'
import { useGeofencing } from '../composables/useGeofencing'
import GeofenceEventBadge from '../components/GeofenceEventBadge.vue'
import type { AssignmentPayload } from '../interfaces/geofencing.interface'

const { m } = useI18n()

const route = useRoute()
const id = String(route.params.id)
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let overlayLayer: L.LayerGroup | null = null

const {
  geofence,
  events,
  loading,
  saving,
  error,
  getGeofence,
  addAssignment,
  deleteAssignment,
  getEvents,
} = useGeofencing()

const { vehicles, getVehicles } = useVehicles()

const assignmentForm = reactive<AssignmentPayload>({
  assign_type: 'vehicle',
  assign_id: '',
})
const assignmentError = ref('')



const assignTypeOptions = [
  { value: 'vehicle', label: m.value.adminGeofencesUi.vehicle },
  { value: 'fleet', label: m.value.adminGeofencesUi.fleet },
]

const assignmentColumns = [
  { key: 'id', label: 'ID' },
  { key: 'type', label: m.value.adminGeofencesUi.colType },
  { key: 'assign_id', label: m.value.adminGeofencesUi.assignId },
  { key: 'actions', label: m.value.commonUi.actions, srOnly: true },
]

const eventColumns = [
  { key: 'id', label: 'ID' },
  { key: 'vehicle_id', label: m.value.adminGeofenceDetailUi.vehicle },
  { key: 'event_type', label: m.value.adminGeofenceEventsUi.colEventType },
  { key: 'position', label: m.value.adminGeofenceEventsUi.colPosition },
  { key: 'occurred_at', label: m.value.adminGeofenceEventsUi.colOccurredAt },
]

const vehicleOptions = computed(() => {
  const options = vehicles.value.map((vehicle) => ({
    value: String(vehicle.id),
    label: `${vehicle.license_plate} (${vehicle.id})`,
  }))

  return [{ value: '', label: m.value.adminGeofenceDetailUi.selectVehicle }, ...options]
})

const assignments = computed(() => geofence.value?.assignments || [])

onMounted(async () => {
  await Promise.all([
    getGeofence(id),
    getEvents({ geofence_id: id, page: 1 }),
    getVehicles(1),
  ])

  await nextTick()
  renderMap()
})

// Refresh map when geofence or events change
watch([() => geofence.value, () => events.value], async () => {
  await nextTick()
  renderMap()
}, { deep: true })

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const handleCreateAssignment = async () => {
  assignmentError.value = ''

  if (!assignmentForm.assign_id) {
    assignmentError.value = m.value.adminGeofenceDetailUi.assignmentRequired
    return
  }

  await addAssignment(id, {
    assign_type: assignmentForm.assign_type,
    assign_id: assignmentForm.assign_id,
  })

  assignmentForm.assign_id = ''
  await getGeofence(id)
}

const handleDeleteAssignment = async (assignmentId: string | number) => {
  await deleteAssignment(id, assignmentId)
  await getGeofence(id)
}

const renderMap = () => {
  if (!mapContainer.value || !geofence.value) return

  if (!map) {
    map = L.map(mapContainer.value, {
      zoomControl: true,
    }).setView([41.38512, 2.1735], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    setTimeout(() => {
      map?.invalidateSize()
    }, 100)
  }

  if (overlayLayer) {
    overlayLayer.remove()
  }
  overlayLayer = L.layerGroup().addTo(map)

  if (geofence.value.type === 'polygon') {
    const points = (geofence.value.geometry_geojson?.coordinates?.[0] || geofence.value.polygon || geofence.value.coordinates || [])
      .filter((point) => Array.isArray(point) && point.length >= 2)
      .map((point) => [Number(point[1]), Number(point[0])] as [number, number])

    if (points.length >= 3) {
      const polygon = L.polygon(points, {
        color: geofence.value.rule_type === 'forbid' ? '#dc2626' : '#2563eb',
        fillOpacity: 0.2,
      }).addTo(overlayLayer)
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] })
    }
  }

  if (geofence.value.type === 'circle' && geofence.value.center && geofence.value.radius_m) {
    const circle = L.circle([geofence.value.center.lat, geofence.value.center.lng], {
      radius: geofence.value.radius_m,
      color: geofence.value.rule_type === 'forbid' ? '#dc2626' : '#2563eb',
      fillOpacity: 0.2,
    }).addTo(overlayLayer)
    map.fitBounds(circle.getBounds(), { padding: [20, 20] })
  }

  events.value.slice(0, 30).forEach((event) => {
    const color = event.event_type === 'violation' ? '#dc2626' : event.event_type === 'enter' ? '#16a34a' : '#64748b'
    L.circleMarker([event.position.lat, event.position.lng], {
      radius: 6,
      color,
      fillColor: color,
      fillOpacity: 0.9,
    })
      .bindPopup(`${event.event_type.toUpperCase()} · vehicle ${event.vehicle_id}`)
      .addTo(overlayLayer as L.LayerGroup)
  })
}
</script>

<style scoped>
.leaflet-control-zoom {
  border: 1px solid var(--app-border);
  border-radius: 4px;
  background: var(--app-surface);
}

.leaflet-control-zoom a {
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  color: var(--app-text);
  background: var(--app-surface);
  border: none;
  border-bottom: 1px solid var(--app-border);
}

.leaflet-control-zoom a:last-child {
  border-bottom: none;
}

.leaflet-control-zoom a:hover {
  background: var(--app-surface-alt);
  color: var(--fleetly-baltic-blue);
}
</style>
