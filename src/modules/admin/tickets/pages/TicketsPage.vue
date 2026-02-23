<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-4">Admin - Tickets</h1>

    <div class="flex items-center gap-3 mb-4">
      <label class="text-sm text-gray-400">Filter:</label>
      <select v-model="filterType" class="bg-gray-800 text-sm rounded px-2 py-1">
        <option value="all">All</option>
        <option value="user">By user</option>
      </select>
      <select v-if="filterType === 'user'" v-model="userFilter" class="bg-gray-800 text-sm rounded px-2 py-1">
        <option value="">-- Select user --</option>
        <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
      </select>
    </div>

    <div v-if="loading" class="text-gray-400">Loading tickets...</div>

    <div v-else class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div v-if="tickets.length === 0" class="text-gray-400">No tickets found.</div>

      <div v-for="t in filteredActiveTickets" :key="t.id" class="relative bg-gray-800 p-2 rounded-md shadow-sm text-sm">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div class="text-sm font-semibold">{{ t.subject || t.title || `Ticket #${t.id}` }}</div>
              <div class="text-sm text-gray-400">• {{ t.created_at ? new Date(t.created_at).toLocaleString() : '' }}</div>
            </div>

            <div class="mt-2 text-sm text-gray-300">
              <div class="text-xs text-gray-400">User</div>
              <div class="truncate">{{ t.user?.name || t.user_name || '-' }} <span class="text-gray-500">({{ t.user?.email || t.user_email || '-' }})</span></div>
            </div>

            <div class="mt-3 text-sm text-gray-300">
              <div class="text-xs text-gray-400">Last message</div>
              <div class="mt-1">{{ t.last_message?.content || t.message || t.description || '-' }}</div>
            </div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <button @click.prevent="toggleExpand(t.id)" class="text-indigo-400 text-sm">{{ expanded[t.id] ? 'Hide' : 'View conversation' }}</button>
            <RouterLink :to="`/admin/tickets/${t.id}`" class="text-indigo-300 text-sm">Open detail</RouterLink>
          </div>
        </div>

        <transition name="fade">
          <div v-if="expanded[t.id]" class="mt-2 bg-gray-900 p-2 rounded">
            <div v-if="loadingDetails[t.id]" class="text-gray-400">Loading conversation...</div>
            <div v-else>
              <div v-for="m in details[t.id] || []" :key="m.id" class="mb-2 p-1 rounded border border-white/5">
                <div class="text-xs text-gray-400">{{ m.user?.name || (m.is_support ? 'Support' : 'User') }} • {{ m.created_at ? new Date(m.created_at).toLocaleString() : '' }}</div>
                <div class="mt-1 text-sm text-gray-200">{{ m.content || m.message || m.body || '' }}</div>
              </div>

              <div class="mt-2">
                <textarea v-model="replyForms[t.id]" rows="2" class="w-full p-1 bg-gray-800 border border-white/10 rounded text-sm" placeholder="Write a reply..."></textarea>
                <div class="text-right mt-2">
                  <button @click.prevent="sendReply(t.id)" class="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs">Send</button>
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

    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-2">Completed</h2>
      <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div v-if="completedTickets.length === 0" class="text-gray-400">No completed tickets.</div>

        <div v-for="t in completedTickets" :key="'completed-'+t.id" class="relative bg-gray-800 p-2 rounded-md shadow-sm text-sm">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <div class="text-sm font-semibold">{{ t.subject || t.title || `Ticket #${t.id}` }}</div>
                <div class="text-sm text-gray-400">• {{ t.created_at ? new Date(t.created_at).toLocaleString() : '' }}</div>
              </div>

              <div class="mt-2 text-sm text-gray-300">
                <div class="text-xs text-gray-400">User</div>
                <div class="truncate">{{ t.user?.name || t.user_name || '-' }} <span class="text-gray-500">({{ t.user?.email || t.user_email || '-' }})</span></div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <RouterLink :to="`/admin/tickets/${t.id}`" class="text-indigo-300 text-sm">Open detail</RouterLink>
            </div>
          </div>
          <div class="absolute right-2 bottom-2">
            <span class="inline-block px-2 py-0.5 rounded text-xs bg-red-700 text-white">Completed</span>
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

// expanded state per ticket and cache for details
const expanded = ref<Record<string, boolean>>({})
const details = ref<Record<string, any[]>>({})
const loadingDetails = ref<Record<string, boolean>>({})
const replyForms = ref<Record<string, string>>({})

const filterType = ref('all') // 'all'|'user'
const userFilter = ref('')
const users = computed(() => {
  const map = new Map()
  ;(tickets.value || []).forEach((t: any) => {
    const uid = t.user?.id ?? t.user_id ?? t.user_email
    const name = t.user?.name ?? t.user_name ?? t.user_email ?? String(uid)
    if (uid) map.set(String(uid), name)
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})
const filteredActiveTickets = computed(() => {
  return (tickets.value || []).filter((t: any) => t.active && (filterType.value !== 'user' || !userFilter.value || String(t.user?.id ?? t.user_id ?? t.user_email) === String(userFilter.value)))
})
const completedTickets = computed(() => {
  return (tickets.value || []).filter((t: any) => !t.active && (filterType.value !== 'user' || !userFilter.value || String(t.user?.id ?? t.user_id ?? t.user_email) === String(userFilter.value)))
})

// Admin should call the general /tickets endpoint; backend will return all tickets if the user has tickets.manage
const load = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/tickets')
    tickets.value = res.data.data ?? res.data ?? []
  } catch (e: any) {
    console.error(e)
    showToast('Error loading admin tickets', 'error')
  } finally {
    loading.value = false
  }
}

const loadDetails = async (ticketId: string | number) => {
  loadingDetails.value = { ...(loadingDetails.value || {}), [ticketId]: true }
  try {
    // use /tickets/{id} which returns ticket with user and messages
    const res = await apiClient.get(`/tickets/${ticketId}`)
    const data = res.data.data ?? res.data
    details.value = { ...(details.value || {}), [ticketId]: data.messages ?? data.data?.messages ?? [] }
  } catch (e) {
    console.error(e)
    showToast('Error loading ticket conversation', 'error')
  } finally {
    loadingDetails.value = { ...(loadingDetails.value || {}), [ticketId]: false }
  }
}

const sendReply = async (ticketId: string | number) => {
  const idStr = String(ticketId)
  const text = (replyForms.value || {})[idStr] || ''
  if (!text) return
  try {
    const payload = { ticket_id: ticketId, message: text }
    const res = await apiClient.post(`/tickets/${ticketId}/messages`, payload)
    const newMsg = res.data.data ?? res.data
    if (newMsg) {
      const arr = details.value[idStr] || []
      arr.push(newMsg)
      details.value = { ...(details.value || {}), [idStr]: arr }
      replyForms.value = { ...(replyForms.value || {}), [idStr]: '' }
      showToast('Mensaje enviado')
    }
  } catch (e: any) {
    console.error(e)
    const resp = e?.response
    if (resp?.data) showToast(JSON.stringify(resp.data), 'error')
    else showToast('Error sending message', 'error')
  }
}

const toggleExpand = async (ticketId: string | number) => {
  const idStr = String(ticketId)
  const isExpanded = !!expanded.value[idStr]
  expanded.value = { ...(expanded.value || {}), [idStr]: !isExpanded }
  if (!isExpanded && !(details.value && details.value[idStr])) {
    await loadDetails(idStr)
  }
}

onMounted(load)
</script>
