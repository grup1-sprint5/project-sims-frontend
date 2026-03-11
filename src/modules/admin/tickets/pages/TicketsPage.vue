<template>
  <div class="px-4 sm:px-6 lg:px-8">

    <!-- Header -->
    <PageHeading title="Tickets" description="Manage all support tickets" />

    <!-- Filters -->
    <div class="mt-6 flex flex-wrap gap-3 items-center">
      <input
        v-model="search"
        type="text"
        placeholder="Search by title or user..."
        class="block w-full max-w-xs rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      />
      <select
        v-model="statusFilter"
        class="rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">Loading tickets...</div>

    <!-- Error -->
    <div v-else-if="error" class="mt-8 text-center text-red-500">{{ error }}</div>

    <!-- Table -->
    <AdminsTable v-else :columns="columns" :empty="filteredTickets.length === 0">
      <template #empty>No tickets found.</template>

      <tr v-for="t in filteredTickets" :key="t.id">
        <AdminTd first variant="muted">#{{ t.id }}</AdminTd>
        <AdminTd variant="primary">{{ t.title }}</AdminTd>
        <AdminTd variant="muted">{{ t.user?.name || '-' }}</AdminTd>
        <AdminTd variant="muted">{{ t.user?.email || '-' }}</AdminTd>
        <AdminTd variant="muted">{{ t.messages?.length ?? 0 }}</AdminTd>
        <AdminTd variant="muted">
          <span
            :class="[
              'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
              t.active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            ]"
          >
            {{ t.active ? 'Active' : 'Closed' }}
          </span>
        </AdminTd>
        <AdminTd variant="muted">{{ formatDate(t.created_at) }}</AdminTd>
        <AdminTd variant="actions">
          <div class="flex justify-end gap-2">
            <router-link
              :to="`/admin/tickets/${t.id}`"
              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              title="View"
            >
              <span class="material-icons text-xl">visibility</span>
            </router-link>
            <button
              class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              title="Delete"
              @click="confirmDelete(t)"
            >
              <span class="material-icons text-xl">delete</span>
            </button>
          </div>
        </AdminTd>
      </tr>
    </AdminsTable>

    <!-- Delete confirmation dialog -->
    <ConfirmDialog
      :visible="!!ticketToDelete"
      title="Delete ticket"
      :message="`Are you sure you want to delete ticket '${ticketToDelete?.title}'? This action cannot be undone.`"
      @confirm="handleDeleteConfirmed"
      @cancel="ticketToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTickets } from '@/modules/tickets/composables/useTickets'
import { useToast } from '@/modules/common/composables/useToast'
import type { Ticket } from '@/modules/tickets/interfaces/ticket.interface'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import ConfirmDialog from '@/modules/admin/components/ConfirmDialog.vue'

const { tickets, loading, error, getTickets, deleteTicket } = useTickets()
const toast = useToast()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'user', label: 'User' },
  { key: 'email', label: 'Email' },
  { key: 'messages', label: 'Messages' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
  { key: 'actions', label: 'Actions', srOnly: true },
]

const search = ref('')
const statusFilter = ref<'all' | 'active' | 'closed'>('all')
const ticketToDelete = ref<Ticket | null>(null)

const filteredTickets = computed(() => {
  return (tickets.value ?? []).filter(t => {
    const matchesSearch =
      !search.value ||
      t.title.toLowerCase().includes(search.value.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.value.toLowerCase())

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && t.active) ||
      (statusFilter.value === 'closed' && !t.active)

    return matchesSearch && matchesStatus
  })
})

const confirmDelete = (t: Ticket) => {
  ticketToDelete.value = t
}

const handleDeleteConfirmed = async () => {
  if (!ticketToDelete.value) return
  try {
    await deleteTicket(ticketToDelete.value.id)
    toast.success('Ticket deleted successfully')
  } catch {
    toast.error('Error deleting ticket')
  } finally {
    ticketToDelete.value = null
  }
}

const formatDate = (iso: string) => iso ? new Date(iso).toLocaleDateString() : '-'

onMounted(() => getTickets())
</script>
