<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-semibold text-[var(--app-text)]">{{ m.adminDashboardUi.title }}</h1>
      <p class="mt-2 text-sm text-[var(--app-muted-text)]/85">{{ m.adminDashboardUi.subtitle }}</p>
    </div>

    <div class="rounded-xl bg-[var(--app-surface)] p-5 ring-1 ring-[var(--app-border)] shadow-sm">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[var(--app-text)]">{{ m.adminDashboardUi.revenueTitle }}</h2>
          <p class="mt-1 text-sm text-[var(--app-muted-text)]/85">{{ m.adminDashboardUi.revenueSubtitle }}</p>
        </div>
        <label class="flex items-center gap-2 text-sm text-[var(--app-muted-text)]/90">
          {{ m.adminDashboardUi.periodLabel }}
          <select
            v-model="revenuePeriod"
            class="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1 text-sm text-[var(--app-text)]"
          >
            <option value="today">{{ m.adminDashboardUi.today }}</option>
            <option value="7d">{{ m.adminDashboardUi.last7Days }}</option>
            <option value="30d">{{ m.adminDashboardUi.last30Days }}</option>
            <option value="year">{{ m.adminDashboardUi.thisYear }}</option>
            <option value="total">{{ m.adminDashboardUi.total }}</option>
          </select>
        </label>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-lg bg-[var(--app-bg)] p-4 ring-1 ring-[var(--app-border)]">
          <p class="text-xs uppercase tracking-wide text-[var(--app-muted-text)]/80">{{ m.adminDashboardUi.grossRevenue }}</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--fleetly-baltic-blue)]">{{ formatCurrency(revenueSummary.gross_revenue) }}</p>
        </div>
        <div class="rounded-lg bg-[var(--app-bg)] p-4 ring-1 ring-[var(--app-border)]">
          <p class="text-xs uppercase tracking-wide text-[var(--app-muted-text)]/80">{{ m.adminDashboardUi.paidBookings }}</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--app-text)]">{{ revenueSummary.paid_reservations }}</p>
        </div>
        <div class="rounded-lg bg-[var(--app-bg)] p-4 ring-1 ring-[var(--app-border)]">
          <p class="text-xs uppercase tracking-wide text-[var(--app-muted-text)]/80">{{ m.adminDashboardUi.averageTicket }}</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--app-text)]">{{ formatCurrency(revenueSummary.average_ticket) }}</p>
        </div>
        <div class="rounded-lg bg-[var(--app-bg)] p-4 ring-1 ring-[var(--app-border)]">
          <p class="text-xs uppercase tracking-wide text-[var(--app-muted-text)]/80">{{ m.adminDashboardUi.pendingPayments }}</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--app-text)]">{{ revenueSummary.pending_payments }}</p>
        </div>
      </div>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="item.to"
        class="group relative overflow-hidden rounded-xl bg-[var(--app-surface)] p-6 ring-1 ring-[var(--app-border)] hover:ring-[var(--fleetly-baltic-blue)] transition shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-[var(--app-text)]">
              {{ item.name }}
            </h2>
            <p class="mt-1 text-sm text-[var(--app-muted-text)]/85">
              {{ item.description }}
            </p>
            <p
              v-if="item.count !== undefined"
              class="mt-3 text-[var(--app-text)]"
            >
              <span class="text-3xl font-semibold">{{ item.count }}</span>
            </p>
          </div>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl"
            :class="item.bgClass"
          >
            <component
              :is="item.icon"
              class="h-6 w-6 [stroke-width:2.2]"
              :class="item.iconClass"
            />
          </div>
        </div>
          <p class="mt-4 text-sm font-medium text-[var(--fleetly-baltic-blue)] group-hover:opacity-80">
          {{ m.adminDashboardUi.goTo.replace('{name}', item.name.toLowerCase()) }}
        </p>
      </RouterLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
  TicketIcon,
} from '@heroicons/vue/24/outline'
import { useUsers } from '@/modules/admin/modules/users/composables/useUsers'
import { useVehicles } from '@/modules/admin/modules/vehicles/composables/useVehicles'
import { useRoles } from '@/modules/admin/modules/roles/composables/useRoles'
import { useBookings } from '@/modules/admin/bookings/composables/useBookings'
import { useTickets } from '@/modules/tickets/composables/useTickets'
import apiClient from '@/services/api'
import { useI18n } from '@/i18n'

const {
  users,
  pagination: usersPagination,
  getUsers,
} = useUsers()
const {
  vehicles,
  pagination: vehiclesPagination,
  getVehicles,
} = useVehicles()
const {
  roles,
  pagination: rolesPagination,
  getRoles,
} = useRoles()
const {
  bookings,
  pagination: bookingsPagination,
  getBookings,
} = useBookings()
const { tickets, getTickets } = useTickets()
const { m } = useI18n()

const loadingStats = ref(false)
const revenuePeriod = ref<'today' | '7d' | '30d' | 'year' | 'total'>('30d')
const revenueSummary = ref({
  gross_revenue: 0,
  paid_reservations: 0,
  average_ticket: 0,
  pending_payments: 0,
})

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(Number(amount || 0))

const loadRevenueSummary = async () => {
  try {
    const response = await apiClient.get('/admin/reservations/revenue-summary', {
      params: { period: revenuePeriod.value },
    })
    revenueSummary.value = {
      gross_revenue: Number(response.data?.gross_revenue || 0),
      paid_reservations: Number(response.data?.paid_reservations || 0),
      average_ticket: Number(response.data?.average_ticket || 0),
      pending_payments: Number(response.data?.pending_payments || 0),
    }
  } catch (e) {
    console.error('Error loading revenue summary', e)
  }
}

onMounted(async () => {
  loadingStats.value = true
  try {
    // Load stats independently so one failing endpoint doesn't block others
    await Promise.all([
      getUsers(1).catch((e) => console.error('Error loading users stats', e)),
      getVehicles(1).catch((e) => console.error('Error loading vehicles stats', e)),
      getRoles(1).catch((e) => console.error('Error loading roles stats', e)),
      getBookings(1).catch((e) => console.error('Error loading bookings stats', e)),
      getTickets().catch((e) => console.error('Error loading tickets stats', e)),
      loadRevenueSummary(),
    ])
  } catch (e) {
    console.error('Error loading admin stats', e)
  } finally {
    loadingStats.value = false
  }
})

watch(revenuePeriod, async () => {
  await loadRevenueSummary()
})

const items = computed(() => [
  {
    name: m.value.adminNav.users,
    description: m.value.adminDashboardUi.usersDesc,
    to: '/admin/users',
    icon: UsersIcon,
    bgClass: 'bg-[#c2d7eb] dark:bg-[#1d4770]',
    iconClass: 'text-[#145d9f] dark:text-[#8fd3ff]',
    count: usersPagination.value.total || users.value.length,
  },
  {
    name: m.value.adminNav.roles,
    description: m.value.adminDashboardUi.rolesDesc,
    to: '/admin/roles',
    icon: ShieldCheckIcon,
    bgClass: 'bg-[#c2d7eb] dark:bg-[#1d4770]',
    iconClass: 'text-[#145d9f] dark:text-[#8fd3ff]',
    count: rolesPagination.value.total || roles.value.length,
  },
  {
    name: m.value.adminNav.bookings,
    description: m.value.adminDashboardUi.bookingsDesc,
    to: '/admin/bookings',
    icon: CalendarDaysIcon,
    bgClass: 'bg-[#c2d7eb] dark:bg-[#1d4770]',
    iconClass: 'text-[#145d9f] dark:text-[#8fd3ff]',
    count: bookingsPagination.value.total || bookings.value.length,
  },
  {
    name: m.value.adminNav.vehicles,
    description: m.value.adminDashboardUi.vehiclesDesc,
    to: '/admin/vehicles',
    icon: TruckIcon,
    bgClass: 'bg-[#c2d7eb] dark:bg-[#1d4770]',
    iconClass: 'text-[#145d9f] dark:text-[#8fd3ff]',
    count: vehiclesPagination.value.total || vehicles.value.length,
  },
  {
    name: m.value.adminNav.tickets,
    description: m.value.adminDashboardUi.ticketsDesc,
    to: '/admin/tickets',
    icon: TicketIcon,
    bgClass: 'bg-[#c2d7eb] dark:bg-[#1d4770]',
    iconClass: 'text-[#145d9f] dark:text-[#8fd3ff]',
    count: tickets.value.length,
  },
])
</script>
