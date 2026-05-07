<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading
      :title="m.adminVehiclesUi.detailTitle"
      :description="m.adminVehiclesUi.detailDescription"
    >
      <template #actions>
        <router-link
          :to="{ path: `/admin/vehicles/${vehicleId}/edit`, query: routeTenantId ? { tenant_id: routeTenantId } : undefined }"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          {{ m.commonUi.edit }}
        </router-link>
        <router-link
          to="/admin/vehicles"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          {{ m.adminVehiclesUi.back }}
        </router-link>
      </template>
    </PageHeading>

    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      {{ m.adminVehiclesUi.loadingDetail }}
    </div>

    <div v-else-if="error" class="mt-8 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="vehicle" class="mt-8">
      <dl class="vehicle-info-list divide-y">
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.commonUi.id }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.id }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminVehiclesUi.plate }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.license_plate }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminVehiclesUi.brand }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.brand || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminVehiclesUi.model }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ vehicle.model || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.commonUi.status }}</dt>
          <dd class="mt-1 sm:col-span-2">
            <StatusBadge :active="vehicle.active" :active-text="m.commonUi.active" :inactive-text="m.commonUi.inactive" />
          </dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.commonUi.created }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ formatDate(vehicle.created_at) }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.commonUi.updated }}</dt>
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
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const { getVehicle, loading, error } = useVehicles()
const { m, locale } = useI18n()

const vehicleId = Number(route.params.id)
const routeTenantId = typeof route.query.tenant_id === 'string' ? route.query.tenant_id : null
const vehicle = ref<Vehicle | null>(null)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : `${locale.value}-ES`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(async () => {
  try {
    vehicle.value = await getVehicle(vehicleId, routeTenantId)
  } catch {
    router.push('/admin/vehicles')
  }
})
</script>

<style scoped>
.vehicle-info-list > :not([hidden]) ~ :not([hidden]) {
  border-color: var(--app-border-strong);
}
</style>
