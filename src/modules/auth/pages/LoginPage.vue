<template>
  <div class="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 sm:px-6">

    <!-- ═══════════════════════════════════════════
         FONS ATMOSFÈRIC
    ═══════════════════════════════════════════ -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <!-- Glow principal (dalt esquerra) -->
      <div class="absolute -top-40 -left-24 h-[600px] w-[700px] rounded-full bg-[var(--fleetly-baltic-blue)]/20 blur-[100px]"></div>
      <!-- Glow secundari (baix centre) -->
      <div class="absolute -bottom-24 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-[var(--fleetly-pale-slate)]/10 blur-3xl"></div>
    </div>

    <!-- Icona vehicle — esquerra (desktop) -->
    <div class="pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 hidden lg:block select-none" aria-hidden="true">
      <img src="/branding/fleetly_isotip_blanc.svg" class="h-[400px] w-[400px] object-contain opacity-[0.06]" alt="" />
    </div>

    <!-- ═══════════════════════════════════════════
         CONTINGUT CENTRAT
    ═══════════════════════════════════════════ -->
    <div class="relative z-10 flex flex-col items-center w-full">

      <!-- Logo -->
      <RouterLink to="/landing" class="mb-10">
        <img class="h-20 w-auto object-contain" src="/branding/fleetly_logotip_blanc.svg" alt="Fleetly" />
      </RouterLink>

      <!-- Card del formulari -->
      <div class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900/80 shadow-2xl shadow-black/60 backdrop-blur-md">

        <!-- Barra de gradient superior -->
        <div class="h-[3px] w-full bg-gradient-to-r from-[var(--fleetly-baltic-blue)] via-[var(--fleetly-pale-slate)]/60 to-transparent"></div>

        <div class="px-7 py-8 sm:px-8">

          <!-- Capçalera de la card -->
          <div class="mb-7 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <img class="h-9 w-auto shrink-0" src="/branding/fleetly_isotip_blanc.svg" alt="" />
              <div>
                <h1 class="text-xl font-extrabold tracking-tight text-white">{{ m.login.title }}</h1>
                <p class="mt-0.5 text-xs text-gray-500">{{ m.login.subtitle }}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">

            <!-- Organització -->
            <div>
              <label for="tenant" class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {{ m.login.orgLabel }}
              </label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </span>
                <input
                  id="tenant"
                  v-model="tenantSlug"
                  type="text"
                  autocomplete="organization"
                  required
                  placeholder="fleetly-barcelona"
                  :disabled="isLoading"
                  class="block w-full rounded-xl bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-700 border border-white/10 focus:border-[var(--fleetly-baltic-blue)]/70 focus:ring-1 focus:ring-[var(--fleetly-baltic-blue)]/50 transition outline-none disabled:opacity-50"
                />
              </div>
              <p class="mt-1.5 text-xs text-gray-600">{{ m.login.orgHint }}</p>
            </div>

            <!-- Correu -->
            <div>
              <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {{ m.login.emailLabel }}
              </label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="tu@empresa.com"
                  :disabled="isLoading"
                  class="block w-full rounded-xl bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-700 border border-white/10 focus:border-[var(--fleetly-baltic-blue)]/70 focus:ring-1 focus:ring-[var(--fleetly-baltic-blue)]/50 transition outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <!-- Contrasenya -->
            <div>
              <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {{ m.login.passwordLabel }}
              </label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :disabled="isLoading"
                  class="block w-full rounded-xl bg-white/5 pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-gray-700 border border-white/10 focus:border-[var(--fleetly-baltic-blue)]/70 focus:ring-1 focus:ring-[var(--fleetly-baltic-blue)]/50 transition outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  :disabled="isLoading"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-300 transition"
                  :aria-label="showPassword ? m.login.hidePassword : m.login.showPassword"
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

            <!-- Error -->
            <div v-if="error" class="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg class="size-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ error }}
            </div>

            <!-- Botó d'enviament -->
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fleetly-baltic-blue)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--fleetly-baltic-blue)]/25 transition hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <svg v-if="isLoading" class="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l4-4m0 0l-4-4m4 4H3"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
              </svg>
              {{ isLoading ? m.login.submitting : m.login.submit }}
            </button>

          </form>
        </div>
      </div>

      <!-- Registre -->
      <p class="mt-6 text-center text-sm text-gray-600">
        {{ m.login.noAccount }}
        <RouterLink to="/register" class="font-semibold text-[var(--fleetly-pale-slate)] hover:text-white transition">
          {{ m.login.register }}
        </RouterLink>
      </p>

      <!-- Tornar a l'inici -->
      <RouterLink to="/landing" class="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-400 transition">
        <svg class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        {{ m.login.backToHome }}
      </RouterLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LanguageSwitcher from '@/modules/common/components/LanguageSwitcher.vue'
import { useI18n } from '@/i18n'

const router = useRouter()
const { login, isLoading, error } = useAuth()
const { m } = useI18n()

const tenantSlug = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  const success = await login(tenantSlug.value, email.value, password.value)
  if (success) {
    router.push('/admin')
  }
}
</script>
