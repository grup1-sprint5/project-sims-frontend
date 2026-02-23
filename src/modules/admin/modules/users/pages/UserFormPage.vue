<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Back button -->
    <div class="mb-6">
      <router-link
        to="/admin/users"
        class="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to users
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
          {{ isEditMode ? 'Edit user' : 'Create new user' }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 py-5 sm:px-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Nombre -->
          <FormField label="Full name">
            <FormInput
              v-model="formData.name"
              type="text"
              placeholder="Full name"
              required
              @invalid="validationErrors.name = 'This field is required'"
              @input="validationErrors.name = ''"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.name }}
            </p>
          </FormField>

          <!-- Username -->
          <FormField label="Username">
            <FormInput
              v-model="formData.username"
              type="text"
              placeholder="Username"
              required
              @invalid="validationErrors.username = 'This field is required'"
              @input="validationErrors.username = ''"
            />
            <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.username }}
            </p>
          </FormField>

          <!-- Email -->
          <FormField label="Email">
            <FormInput
              v-model="formData.email"
              type="email"
              placeholder="email@example.com"
              required
              @invalid="validationErrors.email = 'Invalid email'"
              @input="validationErrors.email = ''"
            />
            <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.email }}
            </p>
          </FormField>

          <!-- Password -->
          <FormField :label="isEditMode ? 'Password (leave blank to keep)' : 'Password'">
            <FormInput
              v-model="formData.password"
              type="password"
              :placeholder="isEditMode ? 'New password (optional)' : 'Password'"
              :required="!isEditMode"
              @invalid="validationErrors.password = isEditMode ? '' : 'Password is required'"
              @input="validationErrors.password = ''"
            />
            <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.password }}
            </p>
          </FormField>

          <!-- Rol (solo para Admin) -->
          <FormField v-if="isCurrentUserAdmin" label="Role">
            <select
              v-model="formData.role_id"
              class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            >
              <option :value="null">Select role</option>
              <option value="1">Client</option>
              <option value="2">Admin</option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only administrators can create users with the Admin role
            </p>
          </FormField>

          <!-- Estado -->
          <FormField label="Status">
            <FormCheckbox
              v-model="formData.active"
              label="Active"
            />
          </FormField>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <router-link
            to="/admin/users"
            class="flex-1 px-4 py-2 text-center text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="isSaving"
            class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isSaving ? 'Saving...' : (isEditMode ? 'Save changes' : 'Create user') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUsers } from '../composables/useUsers'
import { useToast } from '@/modules/common/composables/useToast'
import type { User, UserForm } from '../interfaces/user.interface'
import FormField from '@/modules/admin/components/FormField.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormCheckbox from '@/modules/admin/components/FormCheckbox.vue'

const router = useRouter()
const route = useRoute()
const { getUser, createUser, updateUser, isCurrentUserAdmin, loading } = useUsers()
const toast = useToast()

const userId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEditMode = computed(() => !!userId.value)

const formData = reactive<Partial<UserForm>>({
  name: '',
  username: '',
  email: '',
  password: '',
  active: true,
  role_id: null
})

const validationErrors = reactive({
  name: '',
  username: '',
  email: '',
  password: ''
})

const isSaving = ref(false)

onMounted(async () => {
  if (isEditMode.value && userId.value) {
    try {
      const user = await getUser(userId.value)
      formData.name = user.name
      formData.username = user.username
      formData.email = user.email
      formData.active = user.active
      if (user.roles && user.roles.length > 0) {
        formData.role_id = user.roles[0].id
      }
    } catch (err) {
      toast.error('Error loading user')
      router.push('/admin/users')
    }
  }
})

const handleSubmit = async () => {
  try {
    isSaving.value = true
    
    const submitData: Partial<UserForm> = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      active: formData.active,
      role_id: formData.role_id
    }

    // Only include password if provided
    if (formData.password) {
      submitData.password = formData.password
    }

    if (isEditMode.value && userId.value) {
      await updateUser(userId.value, submitData)
      toast.success('User updated successfully')
    } else {
      await createUser(submitData as UserForm)
      toast.success('User created successfully')
    }

    // Small delay to ensure the toast is visible before navigating away
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/admin/users')
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Error saving user'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}
</script>
