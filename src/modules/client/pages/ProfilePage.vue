<template>
  <div class="min-h-screen bg-gray-900 text-white px-4 py-10">
    <!-- centered container -->
    <div class="mx-auto w-full max-w-lg space-y-8">

      <!-- avatar + heading -->
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold uppercase select-none">
          {{ user.name?.charAt(0) || '?' }}
        </div>
        <h1 class="text-2xl font-bold">My Profile</h1>
        <p v-if="user.email" class="text-sm text-gray-400">{{ user.email }}</p>
      </div>

      <!-- loading skeleton -->
      <div v-if="loading" class="space-y-4 animate-pulse">
        <div class="h-10 rounded bg-gray-700" />
        <div class="h-10 rounded bg-gray-700" />
        <div class="h-10 rounded bg-gray-700" />
      </div>

      <!-- account form -->
      <form v-else @submit.prevent="saveProfile" class="rounded-2xl bg-gray-800/60 backdrop-blur p-6 ring-1 ring-white/5 space-y-5">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UserCircleIcon class="h-5 w-5 text-indigo-400" />
          Account
        </h2>

        <FormInput v-model="user.name" label="Name" :error="errors.name" placeholder="Full name" />
        <FormInput v-model="user.username" label="Username" :error="errors.username" placeholder="Username" />
        <FormInput v-model="user.email" label="Email" :error="errors.email" placeholder="you@example.com" />

        <button
          :disabled="saving"
          class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
        >
          <span v-if="!saving">Save profile</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            Saving…
          </span>
        </button>
      </form>

      <!-- password form -->
      <form @submit.prevent="changePassword" class="rounded-2xl bg-gray-800/60 backdrop-blur p-6 ring-1 ring-white/5 space-y-5">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <LockClosedIcon class="h-5 w-5 text-indigo-400" />
          Change password
        </h2>

        <FormInput v-model="password" label="New password" type="password" :error="errors.password" placeholder="Min. 8 characters" />
        <FormInput v-model="passwordConfirmation" label="Confirm password" type="password" :error="errors.password_confirmation" placeholder="Repeat password" />

        <button
          :disabled="savingPassword"
          class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
        >
          <span v-if="!savingPassword">Change password</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            Saving…
          </span>
        </button>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import api from '@/services/api'
import FormInput from '../../admin/components/FormInput.vue'
import { useToast } from '@/modules/common/composables/useToast'
import { UserCircleIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const savingPassword = ref(false)

const user = reactive<{ id: number | null; name: string; username: string; email: string }>({ id: null, name: '', username: '', email: '' })
const password = ref('')
const passwordConfirmation = ref('')
const errors = reactive<Record<string, string | null>>({ name: null, username: null, email: null, password: null, password_confirmation: null })

async function loadUser() {
  loading.value = true
  try {
    const res = await api.get('/user')
    const u = res.data?.user
    if (u) {
      user.id = u.id
      user.name = u.name ?? ''
      user.username = u.username ?? ''
      user.email = u.email ?? ''
    }
  } catch (e) {
    toast.error('Error loading profile')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function clearErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = null))
}

async function saveProfile() {
  if (!user.id) return
  saving.value = true
  clearErrors()
  try {
    const payload = { name: user.name, username: user.username, email: user.email }
    await api.put(`/users/${user.id}`, payload)
    toast.success('Profile updated')
  } catch (err: any) {
    if (err.response?.status === 422) {
      const data = err.response.data || {}
      const fieldErrors = data.errors || {}
      Object.keys(fieldErrors).forEach((k) => (errors[k] = fieldErrors[k]?.[0] ?? String(fieldErrors[k])))
    } else {
      toast.error('Error updating profile')
    }
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!user.id) return
  savingPassword.value = true
  clearErrors()
  try {
    const payload = { password: password.value, password_confirmation: passwordConfirmation.value }
    await api.put(`/users/${user.id}`, payload)
    toast.success('Password changed')
    password.value = ''
    passwordConfirmation.value = ''
  } catch (err: any) {
    if (err.response?.status === 422) {
      const data = err.response.data || {}
      const fieldErrors = data.errors || {}
      Object.keys(fieldErrors).forEach((k) => (errors[k] = fieldErrors[k]?.[0] ?? String(fieldErrors[k])))
    } else {
      toast.error('Error changing password')
    }
    console.error(err)
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
/* small tweaks to keep visual rhythm */
.form-field + .form-field { margin-top: 0.5rem }
</style>
