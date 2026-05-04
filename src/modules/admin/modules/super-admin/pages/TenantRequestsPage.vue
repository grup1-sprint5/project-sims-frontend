<template>
  <div class="p-6">
    <PageHeading title="Tenant Requests" description="Review and approve company registration requests" />

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && requests.length === 0" class="text-gray-600">No pending requests</div>

    <div v-for="r in requests" :key="r.id" class="border rounded p-4 mb-3">
      <div class="flex justify-between">
        <div>
          <h3 class="font-semibold">{{ r.name }} <span class="text-sm text-gray-500">({{ r.slug }})</span></h3>
          <div class="text-sm text-gray-600">{{ r.email }}</div>
          <div class="text-xs text-gray-500 mt-2">Requested at: {{ r.requested_at }}</div>
        </div>
        <div class="flex items-start gap-2">
          <button class="bg-green-600 text-white px-3 py-1 rounded" @click="approveReq(r.id)">Approve</button>
        </div>
      </div>
      <div v-if="r.notes" class="mt-2 text-sm text-gray-700">Notes: {{ r.notes }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import { useTenantRequests } from '../composables/useTenantRequests'
import { useI18n } from '@/i18n'

const { loading, error, requests, load, approve } = useTenantRequests()

const approveReq = async (id: number) => {
  try {
    await approve(id)
    // simple toast
    alert('Approved')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to approve')
  }
}

onMounted(async () => {
  await load()
})
</script>

<style scoped>
</style>
