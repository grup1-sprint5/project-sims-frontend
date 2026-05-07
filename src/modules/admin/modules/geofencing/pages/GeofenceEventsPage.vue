<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading :title="m.adminGeofenceEventsUi.title" :description="m.adminGeofenceEventsUi.description" />

    <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
      <FormInput v-model="filters.vehicle_id" type="number" :placeholder="m.adminGeofenceEventsUi.vehicleId" @input="handleFilterChange" />

      <FormSelect v-model="filters.geofence_id" @change="handleFilterChange">
        <option v-for="option in geofenceOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
      </FormSelect>

      <FormSelect v-model="filters.event_type" @change="handleFilterChange">
        <option v-for="option in eventTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
      </FormSelect>

      <button class="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-alt)] px-3 py-2 text-sm font-semibold h-10 hover:bg-[var(--app-surface)]" @click="resetFilters">
        {{ m.adminGeofenceEventsUi.reset }}
      </button>
    </div>

    <div v-if="loading" class="mt-8 text-sm text-[var(--app-muted-text)]">{{ m.adminGeofenceEventsUi.loading }}</div>
    <div v-else-if="error" class="mt-8 text-sm text-red-500">{{ error }}</div>

    <AdminsTable v-else :columns="columns" :empty="events.length === 0">
      <template #empty>{{ m.adminGeofenceEventsUi.empty }}</template>

      <tr v-for="event in events" :key="`${event.tenant_id || 'central'}-${event.id}`">
        <AdminTd first variant="muted">{{ event.id }}</AdminTd>
        <AdminTd variant="muted">{{ event.vehicle_id }}</AdminTd>
        <AdminTd variant="muted" class="truncate max-w-[220px]">{{ event.geofence_id }}</AdminTd>
        <AdminTd variant="muted">{{ event.tenant?.name || event.tenant_id || '-' }}</AdminTd>
        <AdminTd variant="muted"><GeofenceEventBadge :event-type="event.event_type" /></AdminTd>
        <AdminTd variant="muted">{{ event.position.lat }}, {{ event.position.lng }}</AdminTd>
        <AdminTd variant="muted">{{ formatDate(event.occurred_at) }}</AdminTd>
      </tr>
    </AdminsTable>

    <AdminPagination
      v-if="eventsPagination.total > 0"
      :page="eventsPagination.current_page"
      :per-page="eventsPagination.per_page"
      :total="eventsPagination.total"
      @update:page="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/i18n'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import AdminPagination from '@/modules/admin/components/AdminPagination.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormSelect from '@/modules/admin/components/FormSelect.vue'
import { useGeofencing } from '../composables/useGeofencing'
import GeofenceEventBadge from '../components/GeofenceEventBadge.vue'

const { m } = useI18n()

const route = useRoute()

const {
  geofences,
  events,
  loading,
  error,
  eventsPagination,
  getGeofences,
  getEvents,
} = useGeofencing()

const filters = reactive({
  vehicle_id: route.query.vehicle_id ? String(route.query.vehicle_id) : '',
  geofence_id: route.query.geofence_id ? String(route.query.geofence_id) : '',
  event_type: '' as '' | 'enter' | 'exit' | 'violation',
})

const columns = [
  { key: 'id', label: m.value.commonUi.id },
  { key: 'vehicle_id', label: m.value.adminGeofenceEventsUi.colVehicle },
  { key: 'geofence_id', label: m.value.adminGeofenceEventsUi.colGeofence },
  { key: 'tenant', label: m.value.adminTenantsUi.title },
  { key: 'event_type', label: m.value.adminGeofenceEventsUi.colEventType },
  { key: 'position', label: m.value.adminGeofenceEventsUi.colPosition },
  { key: 'occurred_at', label: m.value.adminGeofenceEventsUi.colOccurredAt },
]

const eventTypeOptions = [
  { value: '', label: m.value.adminGeofenceEventsUi.allEventTypes },
  { value: 'enter', label: m.value.adminGeofenceEventsUi.enter },
  { value: 'exit', label: m.value.adminGeofenceEventsUi.exit },
  { value: 'violation', label: m.value.adminGeofenceEventsUi.violation },
]

const geofenceOptions = computed(() => {
  const options = geofences.value.map((item) => ({
    value: item.id,
    label: item.name,
  }))

  return [{ value: '', label: m.value.adminGeofenceEventsUi.allGeofences }, ...options]
})

let filterTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  await getGeofences({ page: 1 })
  await loadEvents(1)
})

const loadEvents = (page = eventsPagination.value.current_page) => {
  getEvents({
    vehicle_id: filters.vehicle_id ? Number(filters.vehicle_id) : null,
    geofence_id: filters.geofence_id || '',
    event_type: filters.event_type,
    page,
  })
}

const handleFilterChange = () => {
  if (filterTimeout) clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => loadEvents(1), 350)
}

const handlePageChange = (page: number) => {
  loadEvents(page)
}

const resetFilters = () => {
  filters.vehicle_id = ''
  filters.geofence_id = ''
  filters.event_type = ''
  loadEvents(1)
}

const formatDate = (value: string) => new Date(value).toLocaleString()
</script>
