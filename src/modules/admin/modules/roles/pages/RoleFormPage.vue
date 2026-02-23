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
        Loading...
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-white dark:bg-gray-900 shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {{ isEditMode ? 'Edit role' : 'Create new role' }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 py-5 sm:px-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Name -->
          <FormField label="Role name">
            <FormInput
              v-model="form.name"
              type="text"
              placeholder="Role name"
              required
              :disabled="isAdminRole"
              @invalid="validationErrors.name = 'This field is required'"
              @input="validationErrors.name = ''"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.name }}
            </p>
          </FormField>
        </div>

        <!-- Permissions Table -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Permissions</h4>

          <div v-if="permissionModules.length === 0" class="text-center py-8">
            <p class="text-gray-500">Loading permissions...</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Module</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">View</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Manage</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="module in permissionModules"
                  :key="module.module"
                  class="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {{ module.module }}
                  </td>

                  <td class="px-6 py-4 text-center">
                    <PermissionCheckbox
                      v-if="module.view"
                      :model-value="isPermissionSelected(module.view.id)"
                      :permission-id="`perm-view-${module.view.id}`"
                      label="View"
                      :disabled="isAdminRole"
                      @update:model-value="togglePermission(module.view.id, $event)"
                    />
                    <span v-else class="text-gray-300">-</span>
                  </td>

                  <td class="px-6 py-4 text-center">
                    <PermissionCheckbox
                      v-if="module.manage"
                      :model-value="isPermissionSelected(module.manage.id)"
                      :permission-id="`perm-manage-${module.manage.id}`"
                      label="Manage"
                      :disabled="isAdminRole"
                      @update:model-value="togglePermission(module.manage.id, $event)"
                    />
                    <span v-else class="text-gray-300">-</span>
                  </td>

                  <td class="px-6 py-4 text-center">
                    <PermissionCheckbox
                      v-if="module.delete"
                      :model-value="isPermissionSelected(module.delete.id)"
                      :permission-id="`perm-delete-${module.delete.id}`"
                      label="Delete"
                      :disabled="isAdminRole"
                      @update:model-value="togglePermission(module.delete.id, $event)"
                    />
                    <span v-else class="text-gray-300">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Admin Protected Message -->
        <div v-if="isAdminRole" class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div class="flex">
            <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.593c.75 1.334-.213 3.008-1.743 3.008H3.482c-1.53 0-2.493-1.674-1.743-3.008L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-6a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">The Admin role is protected and cannot be edited.</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <router-link
            to="/admin/roles"
            class="flex-1 px-4 py-2 text-center text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isSaving || isAdminRole"
            class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isSaving ? 'Saving...' : (isEditMode ? 'Save changes' : 'Create role') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/modules/common/composables/useToast'
import FormField from '@/modules/admin/components/FormField.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import PermissionCheckbox from '../components/PermissionCheckbox.vue'
import { useRoles } from '../composables/useRoles'
import { usePermissions } from '../composables/usePermissions'
import type { RoleForm } from '../interfaces/role.interface'

const router = useRouter()
const route = useRoute()
const { currentRole, loading, getRole, createRole, updateRole, isAdminRole } = useRoles()
const { permissionModules, getPermissions } = usePermissions()
const toast = useToast()

const isEditMode = computed(() => route.params.id !== undefined)

const form = reactive<RoleForm>({
  name: '',
  permissions: [],
})

const validationErrors = reactive({
  name: '',
})

const isSaving = ref(false)

const isPermissionSelected = (permissionId: number) => {
  return form.permissions.includes(permissionId)
}

const togglePermission = (permissionId: number, isSelected: boolean) => {
  if (isSelected) {
    if (!form.permissions.includes(permissionId)) {
      form.permissions.push(permissionId)
    }
  } else {
    form.permissions = form.permissions.filter((id) => id !== permissionId)
  }
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    validationErrors.name = 'This field is required'
    return
  }

  let success = false
  isSaving.value = true

  if (isEditMode.value) {
    const roleId = Number(route.params.id)
    success = await updateRole(roleId, form)
  } else {
    success = await createRole(form)
  }

  isSaving.value = false

  if (success) {
    router.push('/admin/roles')
  }
}

onMounted(async () => {
  await getPermissions()

  if (isEditMode.value) {
    const roleId = Number(route.params.id)
    await getRole(roleId)

    if (currentRole.value) {
      form.name = currentRole.value.name
      form.permissions = currentRole.value.permissions?.map((p) => p.id) || []
    } else {
      toast.error('Error loading role')
      router.push('/admin/roles')
    }
  }
})
</script>
