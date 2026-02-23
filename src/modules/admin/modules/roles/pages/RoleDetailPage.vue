<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Back button -->
    <div class="mb-6">
      <router-link
        to="/admin/roles"
        class="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to roles
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center text-gray-500 dark:text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Loading role...
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Detail view -->
    <div v-else-if="currentRole" class="bg-white dark:bg-gray-900 shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {{ currentRole.name }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Full role information
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ currentRole.name }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Permissions</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ currentRole.permissions?.length || 0 }}</dd>
          </div>
        </dl>
      </div>

      <!-- Permissions Table -->
      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Permissions</h4>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Module</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">View</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manage</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="module in permissionModules"
                :key="module.module"
                class="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <AdminTd class="font-semibold">{{ module.module }}</AdminTd>
                <AdminTd>
                  <span
                    v-if="module.view && hasPermission(module.view.id)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    ✓
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </AdminTd>
                <AdminTd>
                  <span
                    v-if="module.manage && hasPermission(module.manage.id)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    ✓
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </AdminTd>
                <AdminTd>
                  <span
                    v-if="module.delete && hasPermission(module.delete.id)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    ✓
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </AdminTd>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 flex gap-3">
        <router-link
          :to="`/admin/roles/${currentRole.id}/edit`"
          v-if="currentRole.name.toLowerCase() !== 'admin'"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit
        </router-link>
        <button
          v-if="currentRole.name.toLowerCase() !== 'admin'"
          @click="openDeleteModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete
        </button>
        <span v-else class="text-gray-500 text-sm">This role is protected</span>
      </div>
    </div>

    <!-- Delete Modal -->
    <RoleDeleteModal
      v-if="showDeleteModal && currentRole"
      :role="currentRole"
      @confirmed="handleDeleteConfirmed"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminTd from '@/modules/admin/components/AdminTd.vue'
import RoleDeleteModal from '../components/RoleDeleteModal.vue'
import { useRoles } from '../composables/useRoles'
import { usePermissions } from '../composables/usePermissions'

const router = useRouter()
const route = useRoute()
const { currentRole, loading, error, getRole } = useRoles()
const { permissionModules, getPermissions } = usePermissions()

const showDeleteModal = ref(false)
const rolePermissionIds = computed(() => currentRole.value?.permissions?.map((p) => p.id) || [])

const hasPermission = (permissionId: number) => {
  return rolePermissionIds.value.includes(permissionId)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const handleDeleteConfirmed = async () => {
  showDeleteModal.value = false
  router.push('/admin/roles')
}

onMounted(async () => {
  const roleId = Number(route.params.id)
  await getRole(roleId)
  await getPermissions()
})
</script>
