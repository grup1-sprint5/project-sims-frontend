<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading
      title="Detalle del vehículo"
      description="Información completa del vehículo"
    >
      <template #actions>
        <router-link
          :to="`/admin/vehicles/${vehicleId}/edit`"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Editar
        </router-link>
        <router-link
          to="/admin/vehicles"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          Volver
        </router-link>
      </template>
    </PageHeading>

    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      Cargando vehículo...
    </div>

    <div v-else-if="error" class="mt-8 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="vehicle" class="mt-8">
      <dl class="divide-y divide-gray-200 dark:divide-white/10">
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.id }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Matrícula</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.license_plate }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Marca</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.brand || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Modelo</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.model || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</dt>
          <dd class="mt-1 sm:col-span-2">
            <StatusBadge :active="vehicle.active" active-text="Activo" inactive-text="Inactivo" />
          </dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ formatDate(vehicle.created_at) }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Actualizado</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ formatDate(vehicle.updated_at) }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicles } from '../composables/useVehicles'
import type { Vehicle } from '../interfaces/vehicle.interface'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { getVehicle, loading, error } = useVehicles()

const vehicleId = Number(route.params.id)
const vehicle = ref<Vehicle | null>(null)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(async () => {
  try {
    vehicle.value = await getVehicle(vehicleId)
  } catch {
    router.push('/admin/vehicles')
  }
})
</script>
