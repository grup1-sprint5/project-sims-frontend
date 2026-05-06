<template>
  <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">

    <div class="w-full max-w-sm">

      <RouterLink to="/landing" class="flex justify-center mb-8">
        <img class="h-20 w-auto" src="/branding/fleetly_logotip_blanc.svg" alt="Fleetly" />
      </RouterLink>

      <div class="rounded-xl border border-white/10 bg-gray-900 px-6 py-8">

        <div class="flex items-center justify-between mb-6">
          <h1 class="text-lg font-semibold text-white">{{ m.register.title }}</h1>
          <LanguageSwitcher />
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">

          <div>
            <label for="tenantSlug" class="block text-sm text-gray-400 mb-1.5">{{ m.register.orgLabel }}</label>
            <input
              id="tenantSlug"
              v-model="tenantSlug"
              type="text"
              required
              :disabled="isLoading || isOrgLocked"
              class="block w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition disabled:opacity-50 disabled:cursor-default"
            />
          </div>

          <div>
            <label for="name" class="block text-sm text-gray-400 mb-1.5">{{ m.register.nameLabel }}</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              placeholder="Joan Pérez"
              :disabled="isLoading"
              class="block w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label for="username" class="block text-sm text-gray-400 mb-1.5">{{ m.register.usernameLabel }}</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              placeholder="joanperez"
              :disabled="isLoading"
              class="block w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label for="email" class="block text-sm text-gray-400 mb-1.5">{{ m.register.emailLabel }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="tu@empresa.com"
              :disabled="isLoading"
              class="block w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label for="password" class="block text-sm text-gray-400 mb-1.5">{{ m.register.passwordLabel }}</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :disabled="isLoading"
                class="block w-full rounded-lg bg-white/5 px-3 pr-10 py-2.5 text-sm text-white border border-white/10 focus:border-[var(--fleetly-baltic-blue)] focus:outline-none transition disabled:opacity-50"
              />
              <button
                type="button"
                :disabled="isLoading"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-300 transition"
                :aria-label="showPassword ? m.register.hidePassword : m.register.showPassword"
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
          </div>

          <div v-if="error" class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg bg-[var(--fleetly-baltic-blue)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="inline-block size-4 animate-spin mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isLoading ? m.register.submitting : m.register.submit }}
          </button>

        </form>
      </div>

      <p class="mt-5 text-center text-sm text-gray-500">
        {{ m.register.hasAccount }}
        <RouterLink to="/login" class="text-gray-300 hover:text-white transition">{{ m.register.signIn }}</RouterLink>
      </p>

      <RouterLink to="/landing" class="mt-3 flex justify-center items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition">
        <svg class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        {{ m.register.backToHome }}
      </RouterLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LanguageSwitcher from '@/modules/common/components/LanguageSwitcher.vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const route = useRoute()
const { register, isLoading, error } = useAuth()
const { m } = useI18n()

const tenantSlug = ref('')
const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

// When org is pre-filled from query param or subdomain, lock the field
const isOrgLocked = computed(() => tenantSlug.value !== '' && !isFromCentralDomain.value)

const isFromCentralDomain = computed(() => {
  if (typeof window === 'undefined') return true
  const host = window.location.hostname.toLowerCase()
  return ['localhost', '127.0.0.1', 'jordiarnau.iemhosting.asix2.iesmontsia.cat'].includes(host)
})

onMounted(() => {
  // Pre-fill from ?org= query param
  const orgParam = route.query.org as string | undefined
  if (orgParam) {
    tenantSlug.value = orgParam
    return
  }
  // Auto-detect from subdomain (e.g. empresa1.jordiarnau...)
  if (!isFromCentralDomain.value) {
    const host = window.location.hostname.toLowerCase()
    const parts = host.split('.')
    if (parts.length >= 3) tenantSlug.value = parts[0]
  }
})

const handleSubmit = async () => {
  await register(
    tenantSlug.value,
    name.value,
    username.value,
    email.value,
    password.value,
  )
}
</script>
