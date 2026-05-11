<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <PageHeading
      :title="m.adminVehiclesUi.title"
      :description="m.adminVehiclesUi.description"
    >
      <template #actions>
        <router-link
          to="/admin/vehicles/create"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {{ m.adminVehiclesUi.add }}
        </router-link>
      </template>
    </PageHeading>

    <!-- Filters -->
    <div class="mt-6">
      <input
        v-model="filters.search"
        @input="handleSearch"
        type="text"
        :placeholder="m.adminVehiclesUi.searchPlaceholder"
        :aria-label="m.adminVehiclesUi.searchPlaceholder"
        class="block w-full max-w-md rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      {{ m.adminVehiclesUi.loading }}
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="mt-8 text-center text-red-500">
      {{ error }}
    </div>

    <!-- Table -->
    <AdminsTable
      v-else
      :columns="columns"
      :empty="vehicles.length === 0"
    >
      <template #empty>
        {{ m.adminVehiclesUi.empty }}
      </template>

      <template v-if="isCurrentUserSuperAdmin">
        <template v-for="group in groupedVehicles" :key="group.key">
          <tr>
            <td
              :colspan="columns.length"
              class="bg-[var(--app-bg)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] sm:px-0"
            >
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{{ group.name }}</span>
                <span class="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--app-muted-text)]">
                  {{ group.vehicles.length }} {{ m.adminVehiclesUi.title.toLowerCase() }}
                </span>
              </div>
            </td>
          </tr>
          <VehicleRow
            v-for="vehicle in group.vehicles"
            :key="`${group.key}-${vehicle.id}`"
            :vehicle="vehicle"
          />
        </template>
      </template>

      <VehicleRow
        v-else
        v-for="vehicle in vehicles"
        :key="`${vehicle.tenant_id || 'central'}-${vehicle.id}`"
        :vehicle="vehicle"
      />
    </AdminsTable>

    <!-- Pagination -->
    <AdminPagination
      v-if="pagination.total > 0"
      :page="pagination.current_page"
      :per-page="pagination.per_page"
      :total="pagination.total"
      @update:page="handlePageChange"
    />

    <!-- Delete confirmation -->
    <ConfirmDialog
      :visible="showDeleteDialog"
      :title="m.adminVehiclesUi.deleteTitle"
      :message="m.adminVehiclesUi.deleteMsg.replace('{plate}', vehicleToDelete?.license_plate || '-')"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, onMounted } from 'vue'
import { useVehicles } from '../composables/useVehicles'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import type { Vehicle, VehicleFilters } from '../interfaces/vehicle.interface'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import AdminPagination from '@/modules/admin/components/AdminPagination.vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'
import ConfirmDialog from '@/modules/admin/components/ConfirmDialog.vue'

const { vehicles, loading, error, pagination, getVehicles, deleteVehicle } = useVehicles()
const { user: currentUser } = useAuth()
const { m } = useI18n()
const router = useRouter()

const isCurrentUserSuperAdmin = computed(() =>
  currentUser.value?.roles?.some((role: any) => {
    const name = typeof role.name === 'string' ? role.name.trim().toLowerCase() : ''
    return name === 'superadmin' || name === 'super admin'
  }) ?? false
)

const groupedVehicles = computed(() => {
  const groups = new Map<string, { key: string; name: string; vehicles: Vehicle[] }>()
  for (const vehicle of vehicles.value) {
    const tenantId = String(vehicle.tenant_id || vehicle.tenant?.id || '').trim()
    const key = tenantId ? tenantId.toLowerCase() : 'central'
    const name = vehicle.tenant?.name || tenantId || 'Central'
    if (!groups.has(key)) groups.set(key, { key, name, vehicles: [] })
    groups.get(key)!.vehicles.push(vehicle)
  }
  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === 'central') return -1
    if (b.key === 'central') return 1
    return a.name.localeCompare(b.name)
  })
})

// Delete state
const showDeleteDialog = ref(false)
const vehicleToDelete = ref<Vehicle | null>(null)

function confirmDelete(vehicle: Vehicle) {
  vehicleToDelete.value = vehicle
  showDeleteDialog.value = true
}

async function handleDelete() {
  if (!vehicleToDelete.value) return
  try {
    await deleteVehicle(vehicleToDelete.value.id, vehicleToDelete.value.tenant_id)
    showDeleteDialog.value = false
    vehicleToDelete.value = null
    loadVehicles()
  } catch {
    showDeleteDialog.value = false
  }
}

const columns = computed(() => [
  { key: 'id', label: m.value.commonUi.id, width: '9%' },
  { key: 'license_plate', label: m.value.adminVehiclesUi.plate, width: '27%' },
  { key: 'brand', label: m.value.adminVehiclesUi.brand, width: '18%' },
  { key: 'model', label: m.value.adminVehiclesUi.model, width: '18%' },
  { key: 'tenant', label: m.value.adminTenantsUi.title, width: '14%' },
  { key: 'active', label: m.value.commonUi.status, width: '12%' },
  { key: 'actions', label: m.value.commonUi.actions, srOnly: true, width: '8%' }
])

const filters = ref<VehicleFilters>({
  search: ''
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  loadVehicles()
})

const loadVehicles = () => {
  getVehicles(pagination.value.current_page, filters.value)
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1
    loadVehicles()
  }, 500)
}

const handlePageChange = (page: number) => {
  pagination.value.current_page = page
  loadVehicles()
}

const VehicleRow = defineComponent({
  name: 'VehicleRow',
  props: { vehicle: { type: Object as () => Vehicle, required: true } },
  setup(props) {
    return () => h('tr', [
      h(AdminTd, { first: true, variant: 'muted' }, () => props.vehicle.id),
      h(AdminTd, { variant: 'primary' }, () => props.vehicle.license_plate),
      h(AdminTd, { variant: 'muted' }, () => props.vehicle.brand || '-'),
      h(AdminTd, { variant: 'muted' }, () => props.vehicle.model || '-'),
      h(AdminTd, { variant: 'muted' }, () => props.vehicle.tenant?.name || props.vehicle.tenant_id || '-'),
      h(AdminTd, { variant: 'muted' }, () =>
        h(StatusBadge, {
          active: props.vehicle.active,
          activeText: m.value.commonUi.active,
          inactiveText: m.value.commonUi.inactive,
        })
      ),
      h(AdminTd, { variant: 'actions' }, () => h('div', { class: 'flex gap-2' }, [
        h('a', {
          href: `#`,
          class: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors',
          'aria-label': `${m.value.commonUi.view} ${props.vehicle.license_plate}`,
          onClick: (e: Event) => {
            e.preventDefault()
            router.push({ path: `/admin/vehicles/${props.vehicle.id}`, query: props.vehicle.tenant_id ? { tenant_id: props.vehicle.tenant_id } : undefined })
          },
        }, [h('span', { class: 'material-icons text-xl', 'aria-hidden': 'true' }, 'visibility')]),
        h('a', {
          href: `#`,
          class: 'text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors',
          'aria-label': `${m.value.commonUi.edit} ${props.vehicle.license_plate}`,
          onClick: (e: Event) => {
            e.preventDefault()
            router.push({ path: `/admin/vehicles/${props.vehicle.id}/edit`, query: props.vehicle.tenant_id ? { tenant_id: props.vehicle.tenant_id } : undefined })
          },
        }, [h('span', { class: 'material-icons text-xl', 'aria-hidden': 'true' }, 'edit')]),
        h('button', {
          class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors',
          'aria-label': `${m.value.commonUi.delete} ${props.vehicle.license_plate}`,
          onClick: () => confirmDelete(props.vehicle),
        }, [h('span', { class: 'material-icons text-xl', 'aria-hidden': 'true' }, 'delete')]),
      ])),
    ])
  },
})
</script>
