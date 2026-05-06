<template>
  <div class="p-6 max-w-4xl">
    <PageHeading title="Company Requests" description="Review and approve company registration requests" />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="text-gray-500">Loading requests...</div>
    </div>

    <!-- Error state -->
    <div v-if="error && !loading" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-red-800 dark:text-red-200">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-if="!loading && requests.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400 mb-3" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No pending requests</h3>
      <p class="text-gray-600 dark:text-gray-400">All company registration requests have been processed</p>
    </div>

    <!-- Requests grid -->
    <div v-if="!loading && requests.length > 0" class="grid gap-4">
      <div v-for="r in requests" :key="r.id" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <!-- Request header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ r.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ r.email }}</p>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            Pending
          </span>
        </div>

        <!-- Request details -->
        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span class="text-gray-600 dark:text-gray-400">Slug:</span>
            <p class="font-mono text-gray-900 dark:text-white mt-1">{{ r.slug }}</p>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">Requested:</span>
            <p class="text-gray-900 dark:text-white mt-1">{{ formatDate(r.requested_at) }}</p>
          </div>
        </div>

        <!-- Subdomain preview -->
        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <span class="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Subdomain</span>
          <p class="text-sm text-blue-900 dark:text-blue-200 font-mono mt-1 break-all">
            https://{{ r.slug }}.jordiarnau.iemhosting.asix2.iesmontsia.cat
          </p>
        </div>

        <!-- Notes if present -->
        <div v-if="r.notes" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <span class="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Notes</span>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ r.notes }}</p>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="approveReq(r.id)"
            :disabled="approving === r.id"
            class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircleIcon v-if="approving !== r.id" class="h-5 w-5" />
            <span v-if="approving !== r.id">Approve Company</span>
            <span v-else>Approving...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import { useTenantRequests } from '../composables/useTenantRequests'
import { BuildingOfficeIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useToast } from '@/modules/common/composables/useToast'

const { loading, error, requests, load, approve } = useTenantRequests()
const approving = ref<number | null>(null)
const toast = useToast()

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const approveReq = async (id: number) => {
  approving.value = id
  try {
    await approve(id)
    toast.success('Company approved successfully')
  } catch (e: any) {
    const message = e?.response?.data?.message || 'Failed to approve company'
    showToast(message, 'error')
  } finally {
    approving.value = null
  }
}

onMounted(async () => {
  await load()
})
</script>

<style scoped>
</style>
