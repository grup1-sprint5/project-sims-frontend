<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading
      :title="m.adminTenantDetailUi.title"
      :description="m.adminTenantDetailUi.description"
    >
      <template #actions>
        <router-link
          :to="`/admin/tenants/${tenantId}/edit`"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          {{ m.adminTenantDetailUi.edit }}
        </router-link>
        <router-link
          to="/admin/tenants"
          class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20"
        >
          {{ m.adminTenantDetailUi.back }}
        </router-link>
      </template>
    </PageHeading>

    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">
      {{ m.adminTenantDetailUi.loading }}
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
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.name }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.name }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.slug }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.slug }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.taxId }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.tax_id || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.email }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.email || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.phone }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.phone || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.address }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.address || '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.status }}</dt>
          <dd class="mt-1 sm:col-span-2">
            <StatusBadge :active="tenant.active" :active-text="m.adminTenantDetailUi.active" :inactive-text="m.adminTenantDetailUi.inactive" />
          </dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.users }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.users_count ?? '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.vehicles }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ tenant.vehicles_count ?? '-' }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.created }}</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">{{ formatDate(tenant.created_at) }}</dd>
        </div>
        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ m.adminTenantDetailUi.updated }}</dt>
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
import { useI18n } from '@/i18n'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { getTenant, loading, error } = useTenants()
const { m } = useI18n()

const tenantId = String(route.params.id)
const tenant = ref<Tenant | null>(null)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(undefined, {
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
