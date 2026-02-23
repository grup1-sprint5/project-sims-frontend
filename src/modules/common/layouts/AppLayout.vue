<template>
  <div class="min-h-[100dvh] bg-gray-900">
    <!-- Top nav (tu template) -->
    <Disclosure as="nav" class="border-b border-white/10 bg-gray-900" v-slot="{ open }">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex shrink-0 items-center">
              <RouterLink to="/">
                <img
                  class="h-8 w-auto"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  alt="SIMS"
                />
              </RouterLink>
            </div>

            <!-- Desktop nav -->
            <div class="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <RouterLink
                v-for="item in navigation"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                :class="isActive(item.to)
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:border-white/20 hover:text-gray-200'"
              >
                {{ item.name }}
              </RouterLink>
            </div>
          </div>

          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <button type="button" class="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
              <span class="absolute -inset-1.5"></span>
              <span class="sr-only">View notifications</span>
              <BellIcon class="size-6" aria-hidden="true" />
            </button>

            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-3">
              <MenuButton class="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span class="absolute -inset-1.5"></span>
                <span class="sr-only">Open user menu</span>
                <img class="size-8 rounded-full outline -outline-offset-1 outline-white/10" :src="user.imageUrl" alt="" />
              </MenuButton>

              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline -outline-offset-1 outline-white/10">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <button
                      v-if="item.type === 'logout'"
                      type="button"
                      @click="handleLogout"
                      :class="[active ? 'bg-white/5 outline-none' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-300']"
                    >
                      {{ item.name }}
                    </button>
                    <RouterLink
                      v-else
                      :to="item.to"
                      :class="[active ? 'bg-white/5 outline-none' : '', 'block px-4 py-2 text-sm text-gray-300']"
                    >
                      {{ item.name }}
                    </RouterLink>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Mobile hamburger -->
          <div class="-mr-2 flex items-center sm:hidden">
            <DisclosureButton class="relative inline-flex items-center justify-center rounded-md bg-gray-900 p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
              <span class="absolute -inset-0.5"></span>
              <span class="sr-only">Open main menu</span>
              <Bars3Icon v-if="!open" class="block size-6" aria-hidden="true" />
              <XMarkIcon v-else class="block size-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <!-- Mobile panel -->
      <DisclosurePanel class="sm:hidden">
        <div class="space-y-1 pt-2 pb-3">
          <DisclosureButton
            v-for="item in navigation"
            :key="item.name"
            as="div"
          >
            <RouterLink
              :to="item.to"
              class="block border-l-4 py-2 pr-4 pl-3 text-base font-medium"
              :class="isActive(item.to)
                ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300'
                : 'border-transparent text-gray-400 hover:border-gray-500 hover:bg-white/5 hover:text-gray-200'"
            >
              {{ item.name }}
            </RouterLink>
          </DisclosureButton>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <!-- Content (MAP / PAGES) -->
    <main class="relative min-h-[calc(100dvh-4rem)] pb-16">
      <router-view />
    </main>

    <!-- Bottom nav (mobile-first) -->
    <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-gray-900/90 backdrop-blur sm:hidden">
      <div class="mx-auto max-w-md px-2 py-2 grid grid-cols-5 text-center text-xs text-gray-300">
        <RouterLink to="/" class="py-2 rounded-xl" :class="isActive('/') ? 'text-white bg-white/5' : ''">Map</RouterLink>
        <RouterLink to="/bookings" class="py-2 rounded-xl" :class="isActive('/bookings') ? 'text-white bg-white/5' : ''">Bookings</RouterLink>
        <RouterLink to="/tickets" class="py-2 rounded-xl" :class="isActive('/tickets') ? 'text-white bg-white/5' : ''">Tickets</RouterLink>
        <RouterLink to="/favoritos" class="py-2 rounded-xl" :class="isActive('/favoritos') ? 'text-white bg-white/5' : ''">Fav</RouterLink>
        <RouterLink to="/perfil" class="py-2 rounded-xl" :class="isActive('/perfil') ? 'text-white bg-white/5' : ''">Profile</RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '@/modules/auth/composables/useAuth'
import showToast from '@/modules/common/composables/useToast'

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const isActive = (path: string) => route.path === path

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

const navigation = [
  { name: 'Map', to: '/vehicles-map' },
  { name: 'Bookings', to: '/bookings' },
  { name: 'Tickets', to: '/tickets' },
  { name: 'Favorites', to: '/favoritos' },
  { name: 'Profile', to: '/perfil' },
]

const userNavigation = [
  { name: 'Your profile', to: '/perfil', type: 'link' },
  { name: 'Settings', to: '/settings', type: 'link' },
  { name: 'Sign out', type: 'logout' },
]

const handleLogout = async () => {
  try {
    await logout()
    showToast('Logged out successfully')
  } catch (_) {
    // El propio useAuth ya muestra el error si falla
  } finally {
    router.push('/login')
  }
}
</script>
