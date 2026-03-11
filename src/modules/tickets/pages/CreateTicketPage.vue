<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Create new ticket</h1>
    <div class="bg-gray-800 p-4 rounded">
      <label class="text-sm text-gray-400">Title</label>
      <input v-model="form.title" class="w-full p-2 mt-1 mb-2 rounded bg-gray-900 border border-white/10" placeholder="Title (required)" />
      <label class="text-sm text-gray-400">Description</label>
      <textarea v-model="form.description" rows="6" class="w-full p-2 mt-1 mb-2 rounded bg-gray-900 border border-white/10" placeholder="Describe your issue..."></textarea>
      <div class="text-right">
        <button @click="createTicket" :disabled="creating" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ creating ? 'Creating...' : 'Create ticket' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/services/api'
import showToast from '@/modules/common/composables/useToast'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ title: '', description: '' })
const creating = ref(false)

const createTicket = async () => {
  if (!form.value.title) return
  creating.value = true
  try {
    const payload = { title: form.value.title, description: form.value.description }
    const res = await apiClient.post('/tickets', payload)
    const newTicket = res.data.data ?? res.data
    showToast('Ticket created')
    // Navigate to ticket conversation
    router.push(`/tickets/${newTicket.id}`)
  } catch (e: any) {
    console.error(e)
    const resp = e?.response
    if (resp?.data) showToast(JSON.stringify(resp.data))
    else showToast('Error creating ticket')
  } finally {
    creating.value = false
  }
}
</script>
