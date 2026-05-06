<template>
  <div class="min-h-[100dvh] bg-[var(--app-bg)] text-[var(--app-text)]">
    <!-- Top nav (tu template) -->
    <nav class="border-b border-[var(--app-border)] bg-[var(--app-surface)]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex shrink-0 items-center">
              <RouterLink to="/">
                <img
                  class="h-9 w-auto object-contain"
                  :src="isDark ? '/branding/fleetly_logotip_blanc.svg' : '/branding/fleetly_logotip_negre.svg'"
                  alt="Fleetly"
                />
              </RouterLink>
            </div>

            <!-- Desktop nav -->
            <div class="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8" data-tour-id="client-main-nav">
              <RouterLink
                v-for="item in navigation"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center gap-1.5 border-b-2 px-1 pt-1 text-sm font-medium"
                :class="isActive(item.to)
                  ? 'border-[var(--fleetly-baltic-blue)] text-[var(--app-text)]'
                  : 'border-transparent text-[var(--app-muted-text)] hover:border-[var(--app-border)] hover:text-[var(--app-text)]'"
              >
                <component :is="item.icon" class="size-5" aria-hidden="true" />
                {{ item.name }}
              </RouterLink>
            </div>
          </div>

          <div class="hidden sm:ml-6 sm:flex sm:items-center gap-3">
            <button
              type="button"
              data-tour-id="client-tour-button"
              class="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-surface-alt)]"
              @click="startGuide(true)"
            >
              <QuestionMarkCircleIcon class="size-4 inline mr-1" />
              {{ m.guidedTour.startGuide }}
            </button>
            <button
              type="button"
              data-tour-id="theme-toggle"
              class="rounded-md p-2 text-[var(--app-muted-text)] hover:bg-[var(--app-surface-alt)] hover:text-[var(--app-text)]"
              @click="toggleTheme"
            >
              <MoonIcon v-if="!isDark" class="size-5" />
              <SunIcon v-else class="size-5" />
            </button>
            <div data-tour-id="language-switcher">
              <LanguageSwitcher />
            </div>
            <button type="button" class="relative rounded-full p-1 text-[var(--fleetly-pale-slate)] hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-[var(--fleetly-baltic-blue)]">
              <span class="absolute -inset-1.5"></span>
              <span class="sr-only">{{ m.userMenu.viewNotifications }}</span>
              <BellIcon class="size-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="rounded-md p-2 text-[var(--app-muted-text)] hover:bg-[var(--app-surface-alt)] hover:text-[var(--app-text)]"
              :title="m.userMenu.signOut"
              @click="handleLogout"
            >
              <span class="sr-only">{{ m.userMenu.signOut }}</span>
              <ArrowRightOnRectangleIcon class="size-6" aria-hidden="true" />
            </button>

            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-3" data-tour-id="user-menu">
              <MenuButton class="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fleetly-baltic-blue)]">
                <span class="absolute -inset-1.5"></span>
                <span class="sr-only">{{ m.adminLayoutUi.openUserMenu }}</span>
                <span class="size-8 rounded-full outline -outline-offset-1 outline-white/10 bg-[var(--fleetly-baltic-blue)] flex items-center justify-center text-xs font-bold text-white">
                  {{ userInitials }}
                </span>
              </MenuButton>

              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-[var(--app-surface)] py-1 outline -outline-offset-1 outline-[var(--app-border)] text-[var(--app-text)]">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <button
                      v-if="item.type === 'logout'"
                      type="button"
                      @click="handleLogout"
                      :class="[active ? 'bg-[var(--app-surface-alt)] outline-none' : '', 'block w-full text-left px-4 py-2 text-sm text-[var(--app-text)]']"
                    >
                      {{ item.name }}
                    </button>
                    <RouterLink
                      v-else
                      :to="item.to"
                      :class="[active ? 'bg-[var(--app-surface-alt)] outline-none' : '', 'block px-4 py-2 text-sm text-[var(--app-text)]']"
                    >
                      {{ item.name }}
                    </RouterLink>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Mobile: top actions -->
          <div class="-mr-2 flex items-center gap-2 sm:hidden">
            <button
              type="button"
              data-tour-id="client-tour-button"
              class="rounded-md p-2 text-[var(--app-muted-text)] hover:bg-[var(--app-surface-alt)] hover:text-[var(--app-text)]"
              @click="startGuide(true)"
            >
              <QuestionMarkCircleIcon class="size-5" />
            </button>
            <button
              type="button"
              data-tour-id="theme-toggle"
              class="rounded-md p-2 text-[var(--app-muted-text)] hover:bg-[var(--app-surface-alt)] hover:text-[var(--app-text)]"
              @click="toggleTheme"
            >
              <MoonIcon v-if="!isDark" class="size-5" />
              <SunIcon v-else class="size-5" />
            </button>
            <div data-tour-id="language-switcher">
              <LanguageSwitcher />
            </div>
            
            <!-- Mobile User Menu -->
            <Menu as="div" class="relative" data-tour-id="user-menu-mobile">
              <MenuButton class="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fleetly-baltic-blue)]">
                <span class="size-8 rounded-full outline -outline-offset-1 outline-white/10 bg-[var(--fleetly-baltic-blue)] flex items-center justify-center text-xs font-bold text-white">
                  {{ userInitials }}
                </span>
              </MenuButton>

              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-[var(--app-surface)] py-1 outline -outline-offset-1 outline-[var(--app-border)] text-[var(--app-text)]">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <button
                      v-if="item.type === 'logout'"
                      type="button"
                      @click="handleLogout"
                      :class="[active ? 'bg-[var(--app-surface-alt)] outline-none' : '', 'block w-full text-left px-4 py-2 text-sm text-[var(--app-text)]']"
                    >
                      {{ item.name }}
                    </button>
                    <RouterLink
                      v-else
                      :to="item.to"
                      :class="[active ? 'bg-[var(--app-surface-alt)] outline-none' : '', 'block px-4 py-2 text-sm text-[var(--app-text)]']"
                    >
                      {{ item.name }}
                    </RouterLink>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>

            <RouterLink
              to="/home/perfil"
              class="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fleetly-baltic-blue)]"
            >
              <span class="sr-only">{{ m.userMenu.yourProfile }}</span>
              <span class="size-8 rounded-full outline -outline-offset-1 outline-white/10 bg-[var(--fleetly-baltic-blue)] flex items-center justify-center text-xs font-bold text-white">
                {{ userInitials }}
              </span>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content (MAP / PAGES) -->
    <main class="relative min-h-[calc(100dvh-4rem)] pb-16" data-tour-id="client-content">
      <router-view />
    </main>

    <!-- Bottom nav (mobile-first) -->
    <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur sm:hidden" data-tour-id="client-mobile-nav">
      <div class="mx-auto max-w-md px-2 py-1 grid grid-cols-5 text-center text-xs text-[var(--app-muted-text)]">
        <RouterLink to="/home/vehicles-map" class="flex items-center justify-center py-2 rounded-xl" :class="isActive('/home/vehicles-map') ? 'text-[var(--fleetly-baltic-blue)]' : 'hover:text-[var(--app-text)]'">
          <MapIcon class="size-6" />
        </RouterLink>
        <RouterLink to="/home/bookings" class="flex items-center justify-center py-2 rounded-xl" :class="isActive('/home/bookings') ? 'text-[var(--fleetly-baltic-blue)]' : 'hover:text-[var(--app-text)]'">
          <CalendarDaysIcon class="size-6" />
        </RouterLink>
        <RouterLink to="/home/tickets" class="flex items-center justify-center py-2 rounded-xl" :class="isActive('/home/tickets') ? 'text-[var(--fleetly-baltic-blue)]' : 'hover:text-[var(--app-text)]'">
          <TicketIcon class="size-6" />
        </RouterLink>
        <RouterLink to="/home/sensors" class="flex items-center justify-center py-2 rounded-xl" :class="isActive('/home/sensors') ? 'text-[var(--fleetly-baltic-blue)]' : 'hover:text-[var(--app-text)]'">
          <WifiIcon class="size-6" />
        </RouterLink>
        <RouterLink to="/home/perfil" class="flex items-center justify-center py-2 rounded-xl" :class="isActive('/home/perfil') ? 'text-[var(--fleetly-baltic-blue)]' : 'hover:text-[var(--app-text)]'">
          <UserIcon class="size-6" />
        </RouterLink>
      </div>
    </nav>

    <!-- AI Chat floating widget -->
    <div data-tour-id="chat-widget">
      <ChatWidget />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BellIcon, MapIcon, CalendarDaysIcon, TicketIcon, UserIcon, WifiIcon, MoonIcon, SunIcon, ArrowRightOnRectangleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '@/modules/auth/composables/useAuth'
import showToast from '@/modules/common/composables/useToast'
import ChatWidget from '@/modules/client/components/ChatWidget.vue'
import LanguageSwitcher from '@/modules/common/components/LanguageSwitcher.vue'
import { useI18n } from '@/i18n'
import { useTheme } from '@/modules/common/composables/useTheme'
import { useGuidedTour } from '@/modules/common/composables/useGuidedTour'

const { m } = useI18n()
const route = useRoute()
const router = useRouter()
const { logout, user: authUser } = useAuth()
const { isDark, toggleTheme } = useTheme()
const { startClientTour } = useGuidedTour()
const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

const userInitials = computed(() => {
  const name = authUser.value?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
})

const navigation = computed(() => [
  { name: m.value.nav.map, to: '/home/vehicles-map', icon: MapIcon },
  { name: m.value.nav.bookings, to: '/home/bookings', icon: CalendarDaysIcon },
  { name: m.value.nav.tickets, to: '/home/tickets', icon: TicketIcon },
  { name: m.value.sensorsUi.title, to: '/home/sensors', icon: WifiIcon },
  { name: m.value.nav.profile, to: '/home/perfil', icon: UserIcon },
])

const userNavigation = computed(() => [
  { name: m.value.userMenu.yourProfile, to: '/home/perfil', type: 'link' },
  { name: m.value.userMenu.signOut, to: '#', type: 'logout' },
])

const handleLogout = async () => {
  try {
    await logout()
    showToast(m.value.userMenu.loggedOut)
  } catch (_) {
    // El propio useAuth ja mostra l'error si falla
  } finally {
    router.push('/login')
  }
}

const startGuide = (force = false) => {
  startClientTour({
    userScope: String(authUser.value?.id ?? 'guest'),
    force,
  })
}

onMounted(async () => {
  await nextTick()
  startGuide(false)
})
</script>
