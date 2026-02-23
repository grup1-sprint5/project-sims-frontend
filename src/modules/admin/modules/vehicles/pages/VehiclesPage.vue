<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <PageHeading
      title="Vehículos"
      description="Gestión de vehículos de la flota"
    >
      <template #actions>
        <router-link
          to="/admin/vehicles/create"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Añadir vehículo
        </router-link>
      </template>
    </PageHeading>

    <!-- Filters -->
    <div class="mt-6">
      <input
        v-model="filters.search"
        @input="handleSearch"
        type="text"
        placeholder="Buscar por matrícula, marca o modelo..."
        class="block w-full max-w-md rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      Cargando vehículos...
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
        No hay vehículos disponibles
      </template>

      <tr v-for="vehicle in vehicles" :key="vehicle.id">
        <AdminTd first variant="muted">
          {{ vehicle.id }}
        </AdminTd>
        <AdminTd variant="primary">
          {{ vehicle.license_plate }}
        </AdminTd>
        <AdminTd variant="muted">
          {{ vehicle.brand || '-' }}
        </AdminTd>
        <AdminTd variant="muted">
          {{ vehicle.model || '-' }}
        </AdminTd>
        <AdminTd variant="muted">
          <StatusBadge :active="vehicle.active" active-text="Activo" inactive-text="Inactivo" />
        </AdminTd>
        <AdminTd variant="actions">
          <div class="flex gap-2">
            <router-link
              :to="`/admin/vehicles/${vehicle.id}`"
              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              title="Ver"
            >
              <span class="material-icons text-xl">visibility</span>
              <span class="sr-only">Ver, {{ vehicle.license_plate }}</span>
            </router-link>
            <router-link
              :to="`/admin/vehicles/${vehicle.id}/edit`"
              class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              title="Editar"
            >
              <span class="material-icons text-xl">edit</span>
              <span class="sr-only">Editar, {{ vehicle.license_plate }}</span>
            </router-link>
            <button
              @click="confirmDelete(vehicle)"
              class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Eliminar"
            >
              <span class="material-icons text-xl">delete</span>
              <span class="sr-only">Eliminar, {{ vehicle.license_plate }}</span>
            </button>
          </div>
        </AdminTd>
      </tr>
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
      title="Eliminar vehículo"
      :message="`¿Estás seguro de que quieres eliminar el vehículo ${vehicleToDelete?.license_plate}?`"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVehicles } from '../composables/useVehicles'
import type { Vehicle, VehicleFilters } from '../interfaces/vehicle.interface'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import AdminPagination from '@/modules/admin/components/AdminPagination.vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'
import ConfirmDialog from '@/modules/admin/components/ConfirmDialog.vue'

const { vehicles, loading, error, pagination, getVehicles, deleteVehicle } = useVehicles()

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
    await deleteVehicle(vehicleToDelete.value.id)
    showDeleteDialog.value = false
    vehicleToDelete.value = null
    loadVehicles()
  } catch {
    showDeleteDialog.value = false
  }
}

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'license_plate', label: 'Matrícula' },
  { key: 'brand', label: 'Marca' },
  { key: 'model', label: 'Modelo' },
  { key: 'active', label: 'Estado' },
  { key: 'actions', label: 'Acciones', srOnly: true }
]

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
</script>
