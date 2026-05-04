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
        <input v-model="form.slug" class="w-full border rounded p-2" required />
        <p class="text-xs text-gray-500 mt-1">Only letters, numbers and dashes. Example: acme-company</p>
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

const reset = () => {
  form.value = { name: '', slug: '', email: '', notes: '' }
  message.value = ''
  error.value = ''
}

const submit = async () => {
  message.value = ''
  error.value = ''
  try {
    const payload = { ...form.value }
    await api.post('/register-company', payload)
    message.value = 'Request submitted. The superadmin will review it.'
    reset()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to submit request'
  }
}
</script>

<style scoped>
</style>
