<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ ticket.subject || ticket.title || `Ticket #${ticket.id}` }}</h1>
        <div class="text-sm text-gray-400">{{ ticket.status || '' }} • {{ ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '' }}</div>
      </div>
      <button @click="load" class="px-2 py-1 bg-gray-700 rounded text-sm">Refresh</button>
    </div>

    <div class="space-y-3">
      <div v-for="m in messages" :key="m.id" class="p-3 rounded" :class="m.is_support ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-100'">
        <div class="text-sm text-gray-400">{{ m.user?.name || (m.is_support ? 'Support' : 'You') }} • {{ m.created_at ? new Date(m.created_at).toLocaleString() : '' }}</div>
        <div class="mt-2">{{ m.content || m.message || m.body || '' }}</div>
        <div class="text-right mt-2">
          <button v-if="m.deletable" @click="deleteMessage(m.id)" class="text-xs text-red-400">Delete</button>
        </div>
      </div>
    </div>

    <div class="mt-6 bg-gray-800 p-4 rounded">
      <textarea v-model="form.message" rows="4" class="w-full p-2 bg-gray-900 border border-white/10 rounded" placeholder="Write a message..."></textarea>
      <div class="text-right mt-2">
        <button @click="sendMessage" :disabled="sending" class="px-3 py-1 rounded bg-indigo-600 text-white">{{ sending ? 'Sending...' : 'Send' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api'
import showToast from '@/modules/common/composables/useToast'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const ticket = ref<any>({})
const messages = ref<any[]>([])
const loading = ref(false)
const sending = ref(false)
const form = ref({ message: '' })

const load = async () => {
  loading.value = true
  try {
    const res = await apiClient.get(`/tickets/${id}`)
    const data = res.data.data ?? res.data
    ticket.value = data
    messages.value = data.messages ?? data.data?.messages ?? []
  } catch (e) {
    console.error(e)
    showToast('Error loading conversation')
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!form.value.message) return
  sending.value = true
  try {
    // send multiple possible field names to satisfy different backend expectations
    const payload = { ticket_id: id, message: form.value.message, content: form.value.message, body: form.value.message, text: form.value.message }
    const res = await apiClient.post(`/tickets/${id}/messages`, payload)
    const newMsg = res.data.data ?? res.data
    if (newMsg) messages.value.push(newMsg)
    form.value.message = ''
  } catch (e: any) {
    const resp = e?.response
    // log full response to help debugging
    console.error('Send message error response:', resp?.status, resp?.data)

    if (resp?.status === 422 && resp.data) {
      const errors = resp.data.errors || resp.data
      console.error('Validation errors creating ticket message:', errors)
      const msg = typeof errors === 'string' ? errors : Object.values(errors).flat().join(' | ')
      showToast(msg)
    } else if (resp?.data) {
      // fallback: show the whole response body so the developer can see expected fields
      const bodyMsg = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data)
      showToast(bodyMsg)
      console.error(resp.data)
    } else {
      console.error(e)
      showToast('Error sending message')
    }
  } finally {
    sending.value = false
  }
}

const deleteMessage = async (messageId: number | string) => {
  try {
    await apiClient.delete(`/messages/${messageId}`)
    messages.value = messages.value.filter(m => m.id !== messageId)
    showToast('Message deleted')
  } catch (e) {
    console.error(e)
    showToast('Error deleting message')
  }
}

onMounted(load)
</script>
