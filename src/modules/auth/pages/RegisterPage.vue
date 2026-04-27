<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12 lg:px-8" style="background:var(--app-bg);color:var(--app-text);">
    <div class="w-full max-w-md rounded-2xl border border-[var(--fleetly-gunmetal)] bg-[var(--fleetly-gunmetal)]/35 p-6 shadow-2xl shadow-black/40 sm:p-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-12 w-auto object-contain" src="/branding/fleetly_logotip_blanc.svg" alt="Fleetly" />
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Create your account</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="tenantSlug" class="block text-sm/6 font-medium text-gray-100">Organization</label>
          <div class="mt-2 text-xs text-gray-400 mb-1">
            Tip: you can use "Fleetly Barcelona" and it will normalize to "fleetly-barcelona".
          </div>
          <div class="mt-2">
            <input
              id="tenantSlug"
              v-model="tenantSlug"
              type="text"
              required
              :disabled="isLoading"
              placeholder="e.g. fleetly-barcelona"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--fleetly-baltic-blue)] sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <label for="name" class="block text-sm/6 font-medium text-gray-100">Full Name</label>
          <div class="mt-2">
            <input
              id="name"
              v-model="name"
              type="text"
              required
              :disabled="isLoading"
              placeholder="e.g. John Doe"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--fleetly-baltic-blue)] sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <label for="username" class="block text-sm/6 font-medium text-gray-100">Username</label>
          <div class="mt-2">
            <input
              id="username"
              v-model="username"
              type="text"
              required
              :disabled="isLoading"
              placeholder="e.g. johndoe"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--fleetly-baltic-blue)] sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-100">Email address</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="isLoading"
              placeholder="e.g. john@example.com"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--fleetly-baltic-blue)] sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm/6 font-medium text-gray-100">Password</label>
          <div class="mt-2 relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              :disabled="isLoading"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 pr-10 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--fleetly-baltic-blue)] sm:text-sm/6"
            />
            <button
              type="button"
              :disabled="isLoading"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
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
            class="flex w-full justify-center rounded-md bg-[var(--fleetly-baltic-blue)] px-3 py-1.5 text-sm/6 font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fleetly-baltic-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Creating account...' : 'Register' }}
          </button>
        </div>

        <p class="text-center text-sm text-gray-400">
          Already have an account?
          <RouterLink to="/login" class="font-semibold leading-6 text-[var(--fleetly-baltic-blue)] hover:opacity-80">Sign in</RouterLink>
        </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register, isLoading, error } = useAuth()

const tenantSlug = ref('')
const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

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
