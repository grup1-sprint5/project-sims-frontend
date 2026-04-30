<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <PageHeading :title="m.adminGeofencesUi.title" :description="m.adminGeofencesUi.description">
      <template #actions>
        <div class="flex gap-2">
          <router-link
            to="/admin/geofence-events"
            class="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500"
          >
              {{ m.adminGeofencesUi.events }}
          </router-link>
          <router-link
            to="/admin/geofences/create"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
              {{ m.adminGeofencesUi.newGeofence }}
          </router-link>
        </div>
      </template>
    </PageHeading>

    <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-5">
      <input
        v-model="filters.name"
        type="text"
        :placeholder="m.adminGeofencesUi.searchByName"
        class="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
        @input="handleFilterChange"
      />

      <select
        v-model="activeFilter"
        class="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
        @change="handleFilterChange"
      >
        <option value="">{{ m.adminGeofencesUi.allStatuses }}</option>
        <option value="true">{{ m.adminGeofencesUi.active }}</option>
        <option value="false">{{ m.adminGeofencesUi.inactive }}</option>
      </select>

      <select
        v-model="filters.assign_type"
        class="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
        @change="handleFilterChange"
      >
        <option value="">{{ m.adminGeofencesUi.allAssignmentTypes }}</option>
        <option value="vehicle">{{ m.adminGeofencesUi.vehicle }}</option>
        <option value="fleet">{{ m.adminGeofencesUi.fleet }}</option>
      </select>

      <input
        v-model="filters.assign_id"
        type="text"
        :placeholder="m.adminGeofencesUi.assignId"
        class="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
        @input="handleFilterChange"
      />

      <button
        type="button"
        class="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-alt)] px-3 py-2 text-sm font-semibold hover:bg-[var(--app-surface)]"
        @click="resetFilters"
      >
        {{ m.adminGeofencesUi.reset }}
      </button>
    </div>

    <div v-if="loading" class="mt-8 text-sm text-[var(--app-muted-text)]">{{ m.adminGeofencesUi.loading }}</div>
    <div v-else-if="error" class="mt-8 text-sm text-red-500">{{ error }}</div>

    <AdminsTable v-else :columns="columns" :empty="geofences.length === 0">
      <template #empty>
        {{ m.adminGeofencesUi.empty }}
      </template>

      <tr v-for="item in geofences" :key="item.id">
        <AdminTd first variant="primary">{{ item.name }}</AdminTd>
        <AdminTd variant="muted" class="uppercase">{{ item.type }}</AdminTd>
        <AdminTd variant="muted" class="uppercase">{{ item.rule_type }}</AdminTd>
        <AdminTd variant="muted">
          <StatusBadge :active="item.active" :active-text="m.adminGeofencesUi.active" :inactive-text="m.adminGeofencesUi.inactive" />
        </AdminTd>
        <AdminTd variant="muted">{{ formatDate(item.updated_at) }}</AdminTd>
        <AdminTd variant="actions">
          <div class="flex justify-end gap-2">
            <router-link :to="`/admin/geofences/${item.id}`" class="text-indigo-500 hover:text-indigo-700" :title="m.commonUi.view">
              <span class="material-icons text-lg">visibility</span>
            </router-link>
            <router-link :to="`/admin/geofences/${item.id}/edit`" class="text-purple-500 hover:text-purple-700" :title="m.commonUi.edit">
              <span class="material-icons text-lg">edit</span>
            </router-link>
            <button class="text-red-500 hover:text-red-700" @click="openDeleteDialog(item)" :title="m.commonUi.delete">
              <span class="material-icons text-lg">delete</span>
            </button>
          </div>
        </AdminTd>
      </tr>
    </AdminsTable>

    <AdminPagination
      v-if="geofencePagination.total > 0"
      :page="geofencePagination.current_page"
      :per-page="geofencePagination.per_page"
      :total="geofencePagination.total"
      @update:page="handlePageChange"
    />

    <ConfirmDialog
      :visible="showDeleteDialog"
      :title="m.adminGeofencesUi.deleteTitle"
      :message="m.adminGeofencesUi.deleteMsg.replace('{name}', geofenceToDelete?.name || '')"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import PageHeading from '@/modules/admin/components/PageHeading.vue'
import AdminsTable from '@/modules/admin/components/AdminsTable.vue'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import AdminPagination from '@/modules/admin/components/AdminPagination.vue'
import ConfirmDialog from '@/modules/admin/components/ConfirmDialog.vue'
import StatusBadge from '@/modules/admin/components/StatusBadge.vue'
import { useGeofencing } from '../composables/useGeofencing'
import type { Geofence, GeofenceFilters } from '../interfaces/geofencing.interface'

const { m } = useI18n()

const {
  geofences,
  geofencePagination,
  loading,
  error,
  getGeofences,
  deleteGeofence,
} = useGeofencing()

const filters = ref<GeofenceFilters>({
  name: '',
  active: '',
  assign_type: '',
  assign_id: '',
})

const activeFilter = ref('')

const showDeleteDialog = ref(false)
const geofenceToDelete = ref<Geofence | null>(null)

const columns = computed(() => [
  { key: 'name', label: m.value.adminGeofencesUi.colName },
  { key: 'type', label: m.value.adminGeofencesUi.colType },
  { key: 'rule_type', label: m.value.adminGeofencesUi.colRule },
  { key: 'active', label: m.value.commonUi.status },
  { key: 'updated_at', label: m.value.commonUi.updated },
  { key: 'actions', label: m.value.commonUi.actions, srOnly: true },
])

let filterTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  loadGeofences(1)
})

const loadGeofences = (page = geofencePagination.value.current_page) => {
  filters.value.page = page
  filters.value.active = activeFilter.value === '' ? '' : activeFilter.value === 'true'
  getGeofences(filters.value)
}

const handleFilterChange = () => {
  if (filterTimeout) clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => loadGeofences(1), 350)
}

const resetFilters = () => {
  filters.value = { name: '', active: '', assign_type: '', assign_id: '' }
  activeFilter.value = ''
  loadGeofences(1)
}

const handlePageChange = (page: number) => {
  loadGeofences(page)
}

const openDeleteDialog = (item: Geofence) => {
  geofenceToDelete.value = item
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!geofenceToDelete.value) return
  await deleteGeofence(geofenceToDelete.value.id)
  showDeleteDialog.value = false
  geofenceToDelete.value = null
  loadGeofences()
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}
</script>
