<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Register your company</h1>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="block text-sm mb-1">Company name</label>
        <input v-model="form.name" class="w-full border rounded p-2" required />
      </div>

      <div class="mb-3">
        <label class="block text-sm mb-1">Slug (subdomain label)</label>
        <input :value="form.slug" @input="onSlugInput" class="w-full border rounded p-2" required />
        <p class="text-xs text-gray-500 mt-1">Only lowercase letters, numbers and dashes.</p>
        <div v-if="slugChecking" class="text-xs text-gray-500 mt-1">Checking availability…</div>
        <div v-else-if="slugAvailable === true" class="text-xs text-green-600 mt-1">Slug available</div>
        <div v-else-if="slugAvailable === false" class="text-xs text-red-600 mt-1">{{ slugError }}</div>
      </div>

      <div class="mb-3">
        <label class="block text-sm mb-1">Contact email</label>
        <input type="email" v-model="form.email" class="w-full border rounded p-2" required />
      </div>

      <div class="mb-3">
        <label class="block text-sm mb-1">Notes (optional)</label>
        <textarea v-model="form.notes" class="w-full border rounded p-2"></textarea>
      </div>

      <div class="flex gap-2">
        <button class="bg-indigo-600 text-white px-4 py-2 rounded">Submit request</button>
        <button type="button" class="px-4 py-2 border rounded" @click="reset">Reset</button>
      </div>
    </form>

    <div v-if="message" class="mt-4 p-3 rounded bg-green-50 text-green-800">{{ message }}</div>
    <div v-if="error" class="mt-4 p-3 rounded bg-red-50 text-red-800">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/services/api'

const form = ref({ name: '', slug: '', email: '', notes: '' })
const message = ref('')
const error = ref('')
const slugAvailable = ref<boolean | null>(null)
const slugChecking = ref(false)
const slugError = ref('')

let slugTimer: number | undefined

const validateSlugFormat = (s: string) => /^[a-z0-9\-]+$/.test(s)

const checkSlug = async (s: string) => {
  slugError.value = ''
  slugAvailable.value = null
  if (!s) return
  if (!validateSlugFormat(s)) {
    slugError.value = 'Only lowercase letters, numbers and dashes are allowed'
    slugAvailable.value = false
    return
  }
  slugChecking.value = true
  try {
    const res = await api.get('/tenant-slugs/check', { params: { slug: s } })
    slugAvailable.value = !!res.data?.available
    if (!slugAvailable.value) slugError.value = res.data?.message || 'Not available'
  } catch (e: any) {
    slugAvailable.value = false
    slugError.value = e?.response?.data?.message || 'Error checking slug'
  } finally {
    slugChecking.value = false
  }
}

const reset = () => {
  form.value = { name: '', slug: '', email: '', notes: '' }
  message.value = ''
  error.value = ''
}

const submit = async () => {
  message.value = ''
  error.value = ''
  if (!validateSlugFormat(form.value.slug)) {
    error.value = 'Invalid slug format. Only lowercase letters, numbers and dashes.'
    return
  }
  if (slugAvailable.value === false) {
    error.value = slugError.value || 'Slug not available'
    return
  }
  try {
    const payload = { ...form.value }
    await api.post('/register-company', payload)
    message.value = 'Request submitted. The superadmin will review it.'
    reset()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to submit request'
  }
}

// Watch slug changes with debounce
const onSlugInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value.toLowerCase()
  form.value.slug = v
  slugAvailable.value = null
  slugError.value = ''
  if (slugTimer) clearTimeout(slugTimer)
  slugTimer = window.setTimeout(() => checkSlug(v), 500)
}
</script>

<style scoped>
</style>
