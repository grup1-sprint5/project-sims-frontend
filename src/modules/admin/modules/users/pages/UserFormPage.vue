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
        {{ m.adminUserFormUi.backToUsers }}
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center text-gray-500 dark:text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        {{ m.adminUserFormUi.loading }}
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-white dark:bg-gray-900 shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {{ isEditMode ? m.adminUserFormUi.editTitle : m.adminUserFormUi.createTitle }}
        </h3>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 py-5 sm:px-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Nombre -->
          <FormField :label="m.adminUserFormUi.fullNameLabel">
            <FormInput
              v-model="formData.name"
              type="text"
              :placeholder="m.adminUserFormUi.fullNamePlaceholder"
              required
              @invalid="validationErrors.name = m.adminUserFormUi.requiredField"
              @input="validationErrors.name = ''"
            />
            <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.name }}
            </p>
          </FormField>

          <!-- Username -->
          <FormField :label="m.adminUserFormUi.usernameLabel">
            <FormInput
              v-model="formData.username"
              type="text"
              :placeholder="m.adminUserFormUi.usernamePlaceholder"
              required
              @invalid="validationErrors.username = m.adminUserFormUi.requiredField"
              @input="validationErrors.username = ''"
            />
            <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.username }}
            </p>
          </FormField>

          <!-- Email -->
          <FormField :label="m.adminUserFormUi.emailLabel">
            <FormInput
              v-model="formData.email"
              type="email"
              :placeholder="m.adminUserFormUi.emailPlaceholder"
              required
              @invalid="validationErrors.email = m.adminUserFormUi.invalidEmail"
              @input="validationErrors.email = ''"
            />
            <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.email }}
            </p>
          </FormField>

          <!-- Password -->
          <FormField :label="isEditMode ? m.adminUserFormUi.passwordLabelEdit : m.adminUserFormUi.passwordLabel">
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="isEditMode ? m.adminUserFormUi.passwordPlaceholderEdit : m.adminUserFormUi.passwordPlaceholder"
                :required="!isEditMode"
                @invalid="validationErrors.password = isEditMode ? '' : m.adminUserFormUi.passwordRequired"
                @input="validationErrors.password = ''"
                class="block w-full rounded-md border-0 px-3 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-300"
                :aria-label="showPassword ? m.adminUserFormUi.hidePassword : m.adminUserFormUi.showPassword"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.122-2.317A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.104 5.063M15 12a3 3 0 00-4.243-2.829M9.88 9.88A3 3 0 0014.12 14.12M3 3l18 18" />
                </svg>
              </button>
            </div>
            <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ validationErrors.password }}
            </p>
          </FormField>

          <!-- Password confirmation -->
          <FormField v-if="formData.password" :label="isEditMode ? m.adminUserFormUi.confirmPasswordLabelEdit : m.adminUserFormUi.confirmPasswordLabel">
            <div class="relative">
              <input
                v-model="formData.password_confirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                :placeholder="isEditMode ? m.adminUserFormUi.confirmPasswordPlaceholderEdit : m.adminUserFormUi.confirmPasswordPlaceholder"
                :required="!!formData.password"
                class="block w-full rounded-md border-0 px-3 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-300"
                :aria-label="showPasswordConfirmation ? m.adminUserFormUi.hidePassword : m.adminUserFormUi.showPassword"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
              >
                <svg v-if="!showPasswordConfirmation" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.122-2.317A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.104 5.063M15 12a3 3 0 00-4.243-2.829M9.88 9.88A3 3 0 0014.12 14.12M3 3l18 18" />
                </svg>
              </button>
            </div>
          </FormField>

          <!-- Rol (solo para Admin) -->
          <FormField v-if="isCurrentUserAdmin" :label="m.adminUserFormUi.roleLabel">
            <select
              v-model="formData.role_id"
              class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            >
              <option :value="null">{{ m.adminUserFormUi.rolePlaceholder }}</option>
              <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </FormField>

          <!-- Empresa/Tenant (solo para Admin) -->
          <FormField v-if="isCurrentUserAdmin && !isEditMode" :label="m.adminUserFormUi.companyLabel">
            <select
              v-model="formData.tenant_id"
              required
              class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            >
              <option :value="null">{{ m.adminUserFormUi.companyPlaceholder }}</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name || tenant.slug }}
              </option>
            </select>
          </FormField>

          <!-- Estado -->
          <FormField :label="m.commonUi.status">
            <FormCheckbox
              v-model="formData.active"
              :label="m.commonUi.active"
            />
          </FormField>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <router-link
            to="/admin/users"
            class="flex-1 px-4 py-2 text-center text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ m.commonUi.cancel }}
          </router-link>
          <button
            type="submit"
            :disabled="isSaving"
            class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isSaving ? m.adminUserFormUi.saving : (isEditMode ? m.adminUserFormUi.saveChanges : m.adminUserFormUi.createUser) }}
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
import { useRoles } from '../../roles/composables/useRoles'
import { useTenants } from '../../tenants/composables/useTenants'
import { useToast } from '@/modules/common/composables/useToast'
import type { UserForm } from '../interfaces/user.interface'
import FormField from '@/modules/admin/components/FormField.vue'
import FormInput from '@/modules/admin/components/FormInput.vue'
import FormCheckbox from '@/modules/admin/components/FormCheckbox.vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const route = useRoute()
const { getUser, createUser, updateUser, isCurrentUserAdmin, loading } = useUsers()
const { roles: availableRoles, getRoles } = useRoles()
const { tenants, getTenants } = useTenants()
const toast = useToast()
const { m } = useI18n()

const userId = computed(() => route.params.id ? Number(route.params.id) : null)
const routeTenantId = computed(() => typeof route.query.tenant_id === 'string' ? route.query.tenant_id : null)
const isEditMode = computed(() => !!userId.value)

const formData = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  active: true,
  role_id: null as number | null,
  tenant_id: null as string | null,
})

const validationErrors = reactive({
  name: '',
  username: '',
  email: '',
  password: ''
})

const isSaving = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

onMounted(async () => {
  await getRoles(1, {})
  await getTenants(1, {})

  if (isEditMode.value && userId.value) {
    try {
      const user = await getUser(userId.value, routeTenantId.value)
      formData.name = user.name
      formData.username = user.username
      formData.email = user.email
      formData.active = user.active
      formData.tenant_id = user.tenant_id || (user.tenant?.id != null ? String(user.tenant.id) : null)
      if (user.roles && user.roles.length > 0) {
        formData.role_id = user.roles[0]?.id ?? null
      }
    } catch (err) {
      toast.error(m.value.adminUserFormUi.loadError)
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
      role_id: formData.role_id,
      tenant_id: formData.tenant_id || undefined,
    }

    // Only include password if provided
    if (formData.password) {
      submitData.password = formData.password
      submitData.password_confirmation = formData.password_confirmation
    }

    if (isEditMode.value && userId.value) {
      await updateUser(userId.value, submitData, routeTenantId.value || formData.tenant_id)
      toast.success(m.value.adminUserFormUi.updatedSuccess)
    } else {
      await createUser(submitData as UserForm)
      toast.success(m.value.adminUserFormUi.createdSuccess)
    }

    // Small delay to ensure the toast is visible before navigating away
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/admin/users')
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || m.value.adminUserFormUi.saveError
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}
</script>
