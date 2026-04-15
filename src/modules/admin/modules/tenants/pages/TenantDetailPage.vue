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

      <!-- Domain management -->
      <div class="mt-10">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ m.adminTenantDetailUi.linkedDomains }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ m.adminTenantDetailUi.domainsDescription }}
        </p>

        <ul v-if="domains.length" class="mt-4 divide-y divide-gray-200 dark:divide-white/10 rounded-md border border-gray-200 dark:border-white/10">
          <li
            v-for="d in domains"
            :key="d.id"
            class="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span class="font-mono text-gray-800 dark:text-gray-200">{{ d.domain }}</span>
            <button @click="removeDomain(d.id)" class="ml-4 text-red-500 hover:text-red-700 text-xs font-medium">
              {{ m.adminTenantDetailUi.remove }}
            </button>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-gray-400 italic">{{ m.adminTenantDetailUi.noDomains }}</p>

        <!-- Add domain form -->
        <form @submit.prevent="addDomain" class="mt-4 flex gap-2">
          <input
            v-model="newDomain"
            type="text"
            :placeholder="m.adminTenantDetailUi.domainPlaceholder"
            class="block flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button
            type="submit"
            :disabled="!newDomain.trim() || domainLoading"
            class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {{ m.adminTenantDetailUi.add }}
          </button>
        </form>
        <p v-if="domainError" class="mt-1 text-xs text-red-500">{{ domainError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenants } from '../composables/useTenants'
import type { Tenant, TenantDomain } from '../interfaces/tenant.interface'
import { useI18n } from '@/i18n'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const { getTenant, loading, error } = useTenants()
const { m } = useI18n()

const tenantId = String(route.params.id)
const tenant = ref<Tenant | null>(null)

// Domains
const domains = ref<TenantDomain[]>([])
const newDomain = ref('')
const domainLoading = ref(false)
const domainError = ref<string | null>(null)

async function loadDomains() {
  try {
    const res = await api.get<{ data: TenantDomain[] }>(`/tenants/${tenantId}/domains`)
    domains.value = res.data.data
  } catch {
    // non-critical
  }
}

async function addDomain() {
  domainError.value = null
  domainLoading.value = true
  try {
    const res = await api.post<{ data: TenantDomain }>(`/tenants/${tenantId}/domains`, {
      domain: newDomain.value.trim(),
    })
    domains.value.push(res.data.data)
    newDomain.value = ''
  } catch (err: any) {
    domainError.value = err.response?.data?.message
    ?? err.response?.data?.errors?.domain?.[0]
    ?? m.value.adminTenantDetailUi.addDomainError
  } finally {
    domainLoading.value = false
  }
}

async function removeDomain(domainId: number) {
  try {
    await api.delete(`/tenants/${tenantId}/domains/${domainId}`)
    domains.value = domains.value.filter(d => d.id !== domainId)
  } catch {
    // ignore
  }
}

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
    await loadDomains()
  } catch {
    router.push('/admin/tenants')
  }
})
</script>
