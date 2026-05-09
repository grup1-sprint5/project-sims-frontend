<template>
  <div class="px-4 sm:px-6 lg:px-8">

    <!-- Header -->
    <PageHeading :title="m.adminTicketsUi.title" :description="m.adminTicketsUi.description" />

    <!-- Filters -->
    <div class="mt-6 flex flex-wrap gap-3 items-center">
      <input
        v-model="search"
        type="text"
        :placeholder="m.adminTicketsUi.searchPlaceholder"
        class="block w-full max-w-xs rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      />
      <select
        v-model="statusFilter"
        class="rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      >
        <option value="all">{{ m.adminTicketsUi.allStatuses }}</option>
        <option value="active">{{ m.commonUi.active }}</option>
        <option value="closed">{{ m.ticketsUi.closed }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500 dark:text-gray-400">{{ m.adminTicketsUi.loading }}</div>

    <!-- Error -->
    <div v-else-if="error" class="mt-8 text-center text-red-500">{{ error }}</div>

    <!-- Table -->
    <AdminsTable v-else :columns="columns" :empty="filteredTickets.length === 0">
      <template #empty>{{ m.adminTicketsUi.empty }}</template>

      <template v-if="isCurrentUserSuperAdmin">
        <template v-for="group in groupedTickets" :key="group.key">
          <tr>
            <td :colspan="columns.length" class="bg-[var(--app-bg)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] sm:px-0">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{{ group.name }}</span>
                <span class="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--app-muted-text)]">
                  {{ group.tickets.length }} {{ m.adminTicketsUi.title.toLowerCase() }}
                </span>
              </div>
            </td>
          </tr>
          <tr v-for="t in group.tickets" :key="`${group.key}-${t.id}`">
            <AdminTd first variant="muted">#{{ t.id }}</AdminTd>
            <AdminTd variant="primary">{{ t.title }}</AdminTd>
            <AdminTd variant="muted">{{ t.tenant?.name || t.tenant_id || '-' }}</AdminTd>
            <AdminTd variant="muted">{{ t.user?.name || '-' }}</AdminTd>
            <AdminTd variant="muted">{{ t.user?.email || '-' }}</AdminTd>
            <AdminTd variant="muted">{{ t.messages?.length ?? 0 }}</AdminTd>
            <AdminTd variant="muted">
              <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', t.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200']">
                {{ t.active ? m.commonUi.active : m.ticketsUi.closed }}
              </span>
            </AdminTd>
            <AdminTd variant="muted">{{ formatDate(t.created_at) }}</AdminTd>
            <AdminTd variant="actions">
              <div class="flex justify-end gap-2">
                <router-link :to="{ path: `/admin/tickets/${t.id}`, query: t.tenant_id ? { tenant_id: t.tenant_id } : undefined }" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" :title="m.commonUi.view">
                  <span class="material-icons text-xl">visibility</span>
                </router-link>
                <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" :title="m.commonUi.delete" @click="confirmDelete(t)">
                  <span class="material-icons text-xl">delete</span>
                </button>
              </div>
            </AdminTd>
          </tr>
        </template>
      </template>

      <tr v-else v-for="t in filteredTickets" :key="`${t.tenant_id || 'central'}-${t.id}`">
        <AdminTd first variant="muted">#{{ t.id }}</AdminTd>
        <AdminTd variant="primary">{{ t.title }}</AdminTd>
        <AdminTd variant="muted">{{ t.tenant?.name || t.tenant_id || '-' }}</AdminTd>
        <AdminTd variant="muted">{{ t.user?.name || '-' }}</AdminTd>
        <AdminTd variant="muted">{{ t.user?.email || '-' }}</AdminTd>
        <AdminTd variant="muted">{{ t.messages?.length ?? 0 }}</AdminTd>
        <AdminTd variant="muted">
          <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-semibold', t.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200']">
            {{ t.active ? m.commonUi.active : m.ticketsUi.closed }}
          </span>
        </AdminTd>
        <AdminTd variant="muted">{{ formatDate(t.created_at) }}</AdminTd>
        <AdminTd variant="actions">
          <div class="flex justify-end gap-2">
            <router-link :to="{ path: `/admin/tickets/${t.id}`, query: t.tenant_id ? { tenant_id: t.tenant_id } : undefined }" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" :title="m.commonUi.view">
              <span class="material-icons text-xl">visibility</span>
            </router-link>
            <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" :title="m.commonUi.delete" @click="confirmDelete(t)">
              <span class="material-icons text-xl">delete</span>
            </button>
          </div>
        </AdminTd>
      </tr>
    </AdminsTable>

    <!-- Delete confirmation dialog -->
    <ConfirmDialog
      :visible="!!ticketToDelete"
      :title="m.adminTicketsUi.deleteTitle"
      :message="m.adminTicketsUi.deleteMsg.replace('{title}', ticketToDelete?.title || '-')"
      @confirm="handleDeleteConfirmed"
      @cancel="ticketToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTickets } from '@/modules/tickets/composables/useTickets'
import { useToast } from '@/modules/common/composables/useToast'
import { useI18n } from '@/i18n'
import { useAuth } from '@/modules/auth/composables/useAuth'
import type { Ticket } from '@/modules/tickets/interfaces/ticket.interface'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import ConfirmDialog from '@/modules/admin/components/ConfirmDialog.vue'

const { tickets, loading, error, getTickets, deleteTicket } = useTickets()
const toast = useToast()
const { m } = useI18n()
const { user: currentUser } = useAuth()

const isCurrentUserSuperAdmin = computed(() =>
  currentUser.value?.roles?.some((role: any) => {
    const name = typeof role.name === 'string' ? role.name.trim().toLowerCase() : ''
    return name === 'superadmin' || name === 'super admin'
  }) ?? false
)

const columns = computed(() => [
  { key: 'id', label: m.value.commonUi.id },
  { key: 'title', label: m.value.ticketsUi.title },
  { key: 'tenant', label: m.value.adminTenantsUi.title },
  { key: 'user', label: m.value.adminTicketsUi.user },
  { key: 'email', label: m.value.commonUi.email },
  { key: 'messages', label: m.value.adminTicketsUi.messages },
  { key: 'status', label: m.value.commonUi.status },
  { key: 'created_at', label: m.value.commonUi.created },
  { key: 'actions', label: m.value.commonUi.actions, srOnly: true },
])

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

const groupedTickets = computed(() => {
  const groups = new Map<string, { key: string; name: string; tickets: Ticket[] }>()
  for (const ticket of filteredTickets.value) {
    const tenantId = String(ticket.tenant_id || ticket.tenant?.id || '').trim()
    const key = tenantId ? tenantId.toLowerCase() : 'central'
    const name = ticket.tenant?.name || tenantId || 'Central'
    if (!groups.has(key)) groups.set(key, { key, name, tickets: [] })
    groups.get(key)!.tickets.push(ticket)
  }
  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === 'central') return -1
    if (b.key === 'central') return 1
    return a.name.localeCompare(b.name)
  })
})

const confirmDelete = (t: Ticket) => {
  ticketToDelete.value = t
}

const handleDeleteConfirmed = async () => {
  if (!ticketToDelete.value) return
  try {
    await deleteTicket(ticketToDelete.value.id, ticketToDelete.value.tenant_id)
    toast.success(m.value.adminTicketsUi.deleteSuccess)
  } catch {
    toast.error(m.value.adminTicketsUi.deleteError)
  } finally {
    ticketToDelete.value = null
  }
}

const formatDate = (iso: string) => iso ? new Date(iso).toLocaleDateString() : '-'

onMounted(() => getTickets())
</script>
