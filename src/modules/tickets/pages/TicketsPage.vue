<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-xl font-semibold">My Tickets</h1>
      <RouterLink to="/tickets/create" class="px-2 py-1 rounded bg-indigo-600 text-white text-sm">New Ticket</RouterLink>
    </div>


    <div v-if="loading" class="text-gray-400">Loading your tickets...</div>

    <div v-else>
      <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="t in activeTickets" :key="t.id" class="relative bg-gray-800 p-3 sm:p-2 rounded-md shadow-sm text-sm flex flex-col justify-between break-words self-start">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div class="font-medium truncate text-sm max-w-full">{{ (t.subject || t.title) ? (t.subject || t.title) : `Ticket #${t.id}` }}<span class="ml-2 inline-block px-2 py-0.5 rounded bg-gray-700 text-xs">{{ (details[t.id]?.length || t.messages?.length || t.messages_count || 0) }} msgs</span></div>
              <div class="text-xs text-gray-400">• {{ t.created_at ? new Date(t.created_at).toLocaleString() : '' }}</div>
            </div>

            <div class="mt-1 text-xs text-gray-300 max-h-12 overflow-hidden">{{ t.description || t.last_message?.content || t.message || '-' }}</div>
          </div>

          <div class="flex flex-col items-end gap-1">
            <span class="inline-block px-2 py-0.5 rounded text-xs" :class="t.active ? 'bg-green-700 text-white' : 'bg-red-700 text-white'">{{ t.active ? 'Active' : 'Inactive' }}</span>
            <button @click.prevent="toggle(t.id)" class="text-indigo-400 text-xs">{{ expanded[t.id] ? 'Hide' : 'Open' }}</button>
            <RouterLink :to="`/tickets/${t.id}`" class="text-indigo-300 text-xs">Full view</RouterLink>
          </div>
        </div>

        <transition name="fade">
          <div v-if="expanded[t.id]" class="mt-2 bg-gray-900 p-2 rounded text-sm">
            <div v-if="loadingDetails[t.id]" class="text-gray-400">Loading...</div>
            <div v-else>
              <div v-for="m in details[t.id] || []" :key="m.id" class="mb-1 p-1 rounded border border-white/5 break-words">
                <div class="text-xs text-gray-400">{{ m.user?.name || 'You' }} • {{ m.created_at ? new Date(m.created_at).toLocaleString() : '' }}</div>
                <div class="mt-1 text-sm text-gray-200">{{ m.content || m.message || m.body || '' }}</div>
              </div>

              <div class="mt-1 pb-6"> <!-- pad bottom so badge doesn't overlap -->
                <textarea v-model="replies[t.id]" rows="2" class="w-full p-1 bg-gray-800 border border-white/10 rounded text-sm" placeholder="Escribe un mensaje..."></textarea>
                <div class="text-right mt-1">
                  <button @click.prevent="sendMessage(t.id)" class="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs">Enviar</button>
                </div>
              </div>
            </div>
          </div>
        </transition>

      </div>
      </div>

      <div class="mt-4">
        <h2 class="text-lg font-semibold mb-2">Completed</h2>
        <div v-if="tickets.filter(tt => !tt.active).length === 0" class="text-gray-400">No completed tickets</div>
        <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-2">
          <div v-for="t in completedTickets" :key="`done-${t.id}`" class="relative bg-gray-800 p-3 sm:p-2 rounded-md shadow-sm text-sm flex flex-col justify-between break-words">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <div class="font-medium truncate text-sm max-w-full">{{ (t.subject || t.title) ? (t.subject || t.title) : `Ticket #${t.id}` }}<span class="ml-2 inline-block px-2 py-0.5 rounded bg-gray-700 text-xs">{{ (details[t.id]?.length || t.messages?.length || t.messages_count || 0) }} msgs</span></div>
                  <div class="text-xs text-gray-400">• {{ t.created_at ? new Date(t.created_at).toLocaleString() : '' }}</div>
                </div>

                <div class="mt-1 text-xs text-gray-300 max-h-12 overflow-hidden">{{ t.description || t.last_message?.content || t.message || '-' }}</div>
              </div>

              <div class="flex flex-col items-end gap-1">
                <button @click.prevent="toggle(t.id)" class="text-indigo-400 text-xs">{{ expanded[t.id] ? 'Hide' : 'Open' }}</button>
                <RouterLink :to="`/tickets/${t.id}`" class="text-indigo-300 text-xs">Full view</RouterLink>
              </div>
            </div>

            <transition name="fade">
              <div v-if="expanded[t.id]" class="mt-2 bg-gray-900 p-2 rounded text-sm">
                <div v-if="loadingDetails[t.id]" class="text-gray-400">Loading...</div>
                <div v-else>
                  <div v-for="m in details[t.id] || []" :key="m.id" class="mb-1 p-1 rounded border border-white/5 break-words">
                    <div class="text-xs text-gray-400">{{ m.user?.name || 'You' }} • {{ m.created_at ? new Date(m.created_at).toLocaleString() : '' }}</div>
                    <div class="mt-1 text-sm text-gray-200">{{ m.content || m.message || m.body || '' }}</div>
                  </div>

                  <div class="mt-1 pb-6"> <!-- pad bottom so badge doesn't overlap -->
                    <textarea v-model="replies[t.id]" rows="2" class="w-full p-1 bg-gray-800 border border-white/10 rounded text-sm" placeholder="Write a message..."></textarea>
                    <div class="text-right mt-1">
                      <button @click.prevent="sendMessage(t.id)" class="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs">Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <div class="absolute right-2 bottom-2">
              <span class="inline-block px-2 py-0.5 rounded text-xs" :class="t.active ? 'bg-green-700 text-white' : 'bg-red-700 text-white'">{{ t.active ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/services/api'
import showToast from '@/modules/common/composables/useToast'

const tickets = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const showForm = ref(false)
const form = ref({ title: '', description: '' })

import { useAuth } from '@/modules/auth/composables/useAuth'
const { user } = useAuth()

const isAdminUser = (u: any) => !!(u && u.roles && u.roles.some((r: any) => (r.name || '').toLowerCase() === 'admin'))

const visibleTickets = computed(() => {
  if (isAdminUser(user.value)) return tickets.value
  return tickets.value.filter(t => t.user_id === user.value?.id || t.user?.id === user.value?.id)
})

const activeTickets = computed(() => visibleTickets.value.filter((t: any) => t.active))
const completedTickets = computed(() => visibleTickets.value.filter((t: any) => !t.active))

const expanded = ref<Record<string, boolean>>({})
const details = ref<Record<string, any[]>>({})
const loadingDetails = ref<Record<string, boolean>>({})
const replies = ref<Record<string, string>>({})

const load = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/tickets')
    tickets.value = res.data.data ?? res.data ?? []
  } catch (e) {
    console.error(e)
    showToast('Error loading your tickets')
  } finally {
    loading.value = false
  }
}

const createTicket = async () => {
  if (!form.value.title) return
  creating.value = true
  try {
    const payload = { title: form.value.title, description: form.value.description }
    const res = await apiClient.post('/tickets', payload)
    const newTicket = res.data.data ?? res.data
    if (newTicket) tickets.value.unshift(newTicket)
    form.value.title = ''
    form.value.description = ''
    showForm.value = false
  } catch (e: any) {
    console.error(e)
    const resp = e?.response
    if (resp?.data) showToast(JSON.stringify(resp.data))
    else showToast('Error creating ticket')
  } finally {
    creating.value = false
  }
}

const toggle = async (ticketId: string | number) => {
  const idStr = String(ticketId)
  const isExpanded = !!expanded.value[idStr]
  expanded.value = { ...(expanded.value || {}), [idStr]: !isExpanded }
  if (!isExpanded && !(details.value && details.value[idStr])) {
    loadingDetails.value = { ...(loadingDetails.value || {}), [idStr]: true }
    try {
      const res = await apiClient.get(`/tickets/${ticketId}`)
      const data = res.data.data ?? res.data
      details.value = { ...(details.value || {}), [idStr]: data.messages ?? data.data?.messages ?? [] }
    } catch (e) {
      console.error(e)
      showToast('Error loading conversation')
    } finally {
      loadingDetails.value = { ...(loadingDetails.value || {}), [idStr]: false }
    }
  }
}

const sendMessage = async (ticketId: string | number) => {
  const idStr = String(ticketId)
  const text = (replies.value || {})[idStr] || ''
  if (!text) return
  try {
    const payload = { ticket_id: ticketId, message: text }
    const res = await apiClient.post(`/tickets/${ticketId}/messages`, payload)
    const newMsg = res.data.data ?? res.data
    if (newMsg) {
      const arr = details.value[idStr] || []
      arr.push(newMsg)
      details.value = { ...(details.value || {}), [idStr]: arr }
      replies.value = { ...(replies.value || {}), [idStr]: '' }
    }
  } catch (e: any) {
    console.error(e)
    const resp = e?.response
    if (resp?.data) showToast(JSON.stringify(resp.data))
    else showToast('Error sending message')
  }
}

onMounted(load)
</script>
