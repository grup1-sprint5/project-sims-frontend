<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading
      title="Detalle del tenant"
      description="Información completa de la organización"
    >
      <template #actions>
        <router-link
          :to="`/admin/tenants/${tenantId}/edit`"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Editar
        </router-link>
        <router-link
          to="/admin/tenants"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          Volver
        </router-link>
      </template>
    </PageHeading>

    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      Cargando tenant...
    </div>

    <div v-else-if="error" class="mt-8 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="tenant" class="mt-8">
      <dl class="divide-y divide-gray-200 dark:divide-white/10">
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.id }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.name }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.slug }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">CIF/NIF</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.tax_id || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.email || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.phone || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.address || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</dt>
          <dd class="mt-1 sm:col-span-2">
            <StatusBadge :active="tenant.active" active-text="Activo" inactive-text="Inactivo" />
          </dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.users_count ?? '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Vehículos</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.vehicles_count ?? '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ formatDate(tenant.created_at) }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Actualizado</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ formatDate(tenant.updated_at) }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenants } from '../composables/useTenants'
import type { Tenant } from '../interfaces/tenant.interface'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { getTenant, loading, error } = useTenants()

const tenantId = Number(route.params.id)
const tenant = ref<Tenant | null>(null)

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
    tenant.value = await getTenant(tenantId)
  } catch {
    router.push('/admin/tenants')
  }
})
</script>
