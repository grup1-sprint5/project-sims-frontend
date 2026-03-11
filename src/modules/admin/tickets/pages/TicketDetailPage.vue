<template>
  <div class="p-4 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-3">
      <div>
        <h2 class="text-lg font-semibold">{{ ticket.subject || ticket.title || `Ticket #${ticket.id}` }}</h2>
        <div class="text-xs text-gray-400">Usuario: {{ ticket.user?.name || ticket.user_name || '-' }} — {{ ticket.user?.email || ticket.user_email || '-' }}</div>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-sm text-gray-400">{{ ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '' }}</div>
        <select v-model="ticket.active" class="bg-gray-800 text-sm rounded px-2 py-1" @change="updateStatus">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </select>
      </div>
    </div>

    <div class="mb-3 text-sm text-gray-300">{{ ticket.description || ticket.message || '-' }}</div>

    <div class="space-y-2">
      <div v-for="m in messages" :key="m.id" class="p-2 rounded bg-gray-800">
        <div class="text-xs text-gray-400">{{ m.user?.name || (m.is_support ? 'Support' : 'User') }} • {{ m.created_at ? new Date(m.created_at).toLocaleString() : '' }}</div>
        <div class="mt-1 text-sm text-gray-200">{{ m.content || m.message || m.body || '' }}</div>
      </div>
    </div>

    <div class="mt-3">
      <textarea v-model="reply" rows="3" class="w-full p-2 bg-gray-900 border border-white/10 rounded text-sm" placeholder="Reply..."></textarea>
      <div class="text-right mt-2">
        <button @click="sendReply" class="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/api'
import showToast from '@/modules/common/composables/useToast'

const route = useRoute()
const id = route.params.id as string

const ticket = ref<any>({})
const messages = ref<any[]>([])
const reply = ref('')
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const res = await apiClient.get(`/tickets/${id}`)
    const data = res.data.data ?? res.data
    ticket.value = data
    // normalize active as boolean
    ticket.value.active = !!(data.active)
    messages.value = data.messages ?? data.data?.messages ?? []
  } catch (e) {
    console.error(e)
    showToast('Error loading ticket')
  } finally {
    loading.value = false
  }
}

const sendReply = async () => {
  if (!reply.value) return
  try {
    const payload = { ticket_id: id, message: reply.value }
    const res = await apiClient.post(`/tickets/${id}/messages`, payload)
    const newMsg = res.data.data ?? res.data
    if (newMsg) messages.value.push(newMsg)
    reply.value = ''
    showToast('Message sent')
  } catch (e: any) {
    console.error(e)
    const resp = e?.response
    if (resp?.data) showToast(JSON.stringify(resp.data))
    else showToast('Error sending message')
  }
}

const updateStatus = async () => {
  try {
    const payload = { active: !!ticket.value.active }
    const res = await apiClient.put(`/tickets/${id}`, payload)
    ticket.value = res.data.data ?? res.data ?? ticket.value
    // normalize
    ticket.value.active = !!(ticket.value.active)
    showToast('Status updated')
  } catch (e) {
    console.error(e)
    showToast('Error updating status')
  }
}

onMounted(load)
</script>
