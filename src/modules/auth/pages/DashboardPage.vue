<template>
  <div class="min-h-screen bg-gray-900 p-8">
    <div class="mx-auto max-w-7xl">
      <div class="lg:col-start-3 lg:row-end-1" v-if="user">
        <h2 class="mb-6 text-2xl font-bold text-white">User Profile</h2>
        <div class="rounded-lg bg-gray-800/50 outline-1 -outline-offset-1 outline-white/10">
          <dl class="flex flex-wrap">
            <div class="flex-auto pt-6 pl-6">
              <dt class="text-sm/6 font-semibold text-gray-100">Name</dt>
              <dd class="mt-1 text-base font-semibold text-white">{{ user.name }}</dd>
            </div>
            <div class="flex-none self-end px-6 pt-4">
              <dt class="sr-only">Status</dt>
              <dd class="inline-flex items-center rounded-md bg-blue-500/15 px-2 py-1 text-xs font-medium text-blue-400 inset-ring inset-ring-blue-500/20">Active</dd>
            </div>
            <div class="mt-6 flex w-full flex-none gap-x-4 border-t border-white/5 px-6 pt-6">
              <dd class="text-sm/6 font-medium text-white break-all">{{ user.email }}</dd>
            </div>
            <div class="mt-6 w-full border-t border-white/5 px-6 pt-6">
              <dt class="text-sm/6 font-semibold text-gray-100">Token</dt>
              <dd class="mt-2 text-xs font-mono text-gray-300 break-all bg-gray-700/50 rounded p-3 max-h-24 overflow-y-auto">{{ token }}</dd>
            </div>
          </dl>
          <div class="mt-6 border-t border-white/5 px-6 py-6 flex gap-4">
            <button
              @click="handleLogout"
              :disabled="isLoading"
              class="text-sm/6 font-semibold text-white hover:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {{ isLoading ? 'Logging out...' : 'Logout' }} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="user && user.roles && user.roles.length > 0" class="mt-8">
        <h2 class="mb-6 text-2xl font-bold text-white">Roles & Permissions</h2>
        <div class="grid gap-4">
          <div v-for="role in user.roles" :key="role.id" class="rounded-lg bg-gray-800/50 outline-1 -outline-offset-1 outline-white/10 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">{{ role.name }}</h3>
              <span class="inline-flex items-center rounded-md bg-purple-500/15 px-2 py-1 text-xs font-medium text-purple-400 inset-ring inset-ring-purple-500/20">Role</span>
            </div>
            <div v-if="role.permissions && role.permissions.length > 0">
              <p class="text-sm text-gray-400 mb-3">Permissions:</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="permission in role.permissions" :key="permission.id" class="inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-xs font-medium text-gray-200">
                  {{ permission.name }}
                </span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400">No permissions assigned</div>
          </div>
        </div>
      </div>

      <div v-else-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p class="mt-4 text-gray-300">Loading user...</p>
        </div>
      </div>

      <!-- Tickets section -->
      <div class="mt-8">
        <h2 class="mb-4 text-2xl font-bold text-white">Tickets</h2>
        <div class="rounded-lg bg-gray-800/50 p-6">
          <div class="flex gap-4">


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, isLoading, logout, getToken } = useAuth()
const token = getToken()

// Prefer checking permissions if backend provides them; fallback to role name check encapsulated here
const isAdmin = computed(() => {
  const u = user.value
  if (!u) return false
  // If permissions are flattened on user (e.g., user.permissions) check them
  if ((u as any).permissions && Array.isArray((u as any).permissions)) {
    // check generic admin-like permissions if present
    return (u as any).permissions.some((p: string) => p.startsWith('can.manage') || p.startsWith('can.view'))
  }
  // Otherwise check roles without scattering logic in template
  if (u.roles && Array.isArray(u.roles)) {
    return u.roles.some((r: any) => (r.name || '').toString().toLowerCase() === 'admin')
  }
  return false
})

const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
