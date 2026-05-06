<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12 lg:px-8" style="background:var(--app-bg);color:var(--app-text);">
    <div class="w-full max-w-md rounded-2xl border p-6 shadow-2xl sm:p-8" style="background:var(--app-surface);border-color:var(--app-border);color:var(--app-text);">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-14 w-auto object-contain sm:h-16" :src="isDark ? '/branding/fleetly_logotip_blanc.svg' : '/branding/fleetly_logotip_negre.svg'" alt="Fleetly" />

        <!-- Tenant company name badge -->
        <div v-if="!isCentralDomain && tenantName" class="mt-4 text-center">
          <span class="inline-block rounded-full px-3 py-1 text-sm font-semibold" style="background:var(--fleetly-baltic-blue);color:#fff;">
            {{ tenantName }}
          </span>
        </div>

        <h2 class="mt-6 text-center text-2xl/9 font-bold tracking-tight" style="color:var(--app-text)">Sign in to your account</h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Organization field: only shown on central domain -->
          <div v-if="isCentralDomain">
            <label for="tenant" class="block text-sm/6 font-medium" style="color:var(--app-muted-text)">Organization</label>
            <div class="mt-2">
              <input
                id="tenant"
                v-model="tenantSlug"
                type="text"
                autocomplete="organization"
                :disabled="isLoading"
                class="block w-full rounded-md px-3 py-1.5 text-base shadow-sm sm:text-sm/6 focus:ring-2 focus:ring-[var(--fleetly-baltic-blue)]"
                style="background:var(--app-input-bg);color:var(--app-input-text);border:1px solid var(--app-input-border);outline:none"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm/6 font-medium" style="color:var(--app-muted-text)">Email address</label>
            <div class="mt-2">
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                :disabled="isLoading"
                class="block w-full rounded-md px-3 py-1.5 text-base shadow-sm sm:text-sm/6 focus:ring-2 focus:ring-[var(--fleetly-baltic-blue)]"
                style="background:var(--app-input-bg);color:var(--app-input-text);border:1px solid var(--app-input-border);outline:none"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm/6 font-medium" style="color:var(--app-muted-text)">Password</label>
            <div class="mt-2 relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="isLoading"
                class="block w-full rounded-md px-3 py-1.5 pr-10 text-base shadow-sm sm:text-sm/6 focus:ring-2 focus:ring-[var(--fleetly-baltic-blue)]"
                style="background:var(--app-input-bg);color:var(--app-input-text);border:1px solid var(--app-input-border);outline:none"
              />
              <button
                type="button"
                :disabled="isLoading"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center"
                style="color:var(--app-muted-text)"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
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

          <div v-if="error" class="text-sm text-red-400">Error: {{ error }}</div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full justify-center rounded-md bg-[var(--fleetly-baltic-blue)] px-3 py-1.5 text-sm/6 font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fleetly-baltic-blue)]"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>

          <!-- Register link: on tenant domains show client self-registration; on central show company registration -->
          <p v-if="!isCentralDomain" class="text-center text-sm text-gray-400">
            Don't have an account?
            <RouterLink :to="registerRoute" class="font-semibold leading-6 text-[var(--fleetly-baltic-blue)] hover:opacity-80">Register</RouterLink>
          </p>
          <p v-else class="text-center text-sm text-gray-400">
            Don't have an account?
            <RouterLink to="/register-company" class="font-semibold leading-6 text-[var(--fleetly-baltic-blue)] hover:opacity-80">Register</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '@/modules/common/composables/useTheme'
import apiClient from '@/services/api'

const router = useRouter()
const { login, isLoading, error } = useAuth()
const { isDark } = useTheme()

const tenantSlug = ref('')
const tenantName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const isCentralDomain = computed(() => {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  const centralDomains = [
    'localhost',
    '127.0.0.1',
    'grup1-sims.com',
    'www.grup1-sims.com',
    'jordiarnau.iemhosting.asix2.iesmontsia.cat'
  ]
  return centralDomains.includes(host)
})

// Build register route including tenant slug so RegisterPage pre-fills the org field
const registerRoute = computed(() => {
  const slug = tenantSlug.value
  return slug ? `/register?org=${encodeURIComponent(slug)}` : '/register'
})

const getTenantSlugFromHost = (): string => {
  if (typeof window === 'undefined') return ''
  const host = window.location.hostname.toLowerCase()
  const parts = host.split('.')
  if (parts.length >= 3) return parts[0]
  if (host.endsWith('.localhost')) return host.split('.')[0]
  return ''
}

onMounted(async () => {
  if (!isCentralDomain.value) {
    const slug = getTenantSlugFromHost()
    if (slug) {
      tenantSlug.value = slug
      try {
        const res = await apiClient.get('/tenant/info', { headers: { 'X-Tenant': slug } })
        tenantName.value = res.data?.name || slug
      } catch {
        tenantName.value = slug
      }
    }
  }
})

const handleSubmit = async () => {
  const tenant = isCentralDomain.value ? '' : tenantSlug.value
  const success = await login(tenant, email.value, password.value)
  if (success) {
    router.push('/admin')
  }
}
</script>
