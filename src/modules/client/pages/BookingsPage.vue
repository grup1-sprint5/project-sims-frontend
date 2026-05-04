<template>
  <div class="min-h-screen" style="background:var(--app-bg);color:var(--app-text);padding-bottom:1.5rem;">
    <div class="container mx-auto px-4 py-7 max-w-4xl">

      <!-- Capçalera -->
      <div class="mb-10">
        <h1 class="text-2xl font-bold" style="color:var(--app-text)">{{ m.bookingsUi.title }}</h1>
        <p class="text-sm mt-1" style="color:var(--app-muted-text)">{{ m.bookingsUi.subtitle }}</p>
      </div>

      <!-- Loading -->
      <div v-if="bookingStore.loading && bookingStore.bookings.length === 0" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Sense reserves -->
      <div v-else-if="bookingStore.bookings.length === 0" class="text-center py-20">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background:var(--app-card-bg);">
          <svg class="h-8 w-8" :style="{color: 'var(--app-muted-text)'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="font-semibold mb-1" style="color:var(--app-text)">{{ m.bookingsUi.emptyTitle }}</p>
        <p class="text-sm mb-6" style="color:var(--app-muted-text)">{{ m.bookingsUi.emptySubtitle }}</p>
        <RouterLink to="/" class="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm" style="background:var(--app-btn-bg);color:var(--app-btn-text);">
          {{ m.bookingsUi.seeMap }}
        </RouterLink>
      </div>

      <template v-else>
        <section class="mb-10 rounded-3xl p-5 md:p-6 balance-panel">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 class="text-sm font-semibold uppercase tracking-wider balance-panel__title">{{ m.bookingsUi.balanceTitle }}</h2>
              <p class="mt-1 text-xs balance-panel__subtitle">{{ m.bookingsUi.balanceSubtitle }}</p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div class="rounded-2xl p-4 balance-card balance-card--available sm:col-span-6">
              <p class="text-xs balance-card__label">{{ m.bookingsUi.walletAvailable }}</p>
              <p class="mt-2 text-3xl md:text-4xl font-extrabold leading-none balance-card__value balance-card__value--primary">{{ formatCurrency(walletBalance) }}</p>
            </div>
            <div class="rounded-2xl p-3.5 balance-card balance-card--paid sm:col-span-3">
              <p class="text-xs balance-card__label">{{ m.bookingsUi.totalPaid }}</p>
              <p class="mt-3 text-2xl md:text-[1.75rem] font-extrabold leading-none balance-card__value">{{ formatCurrency(totalPaidAmount) }}</p>
            </div>
            <div class="rounded-2xl p-3.5 balance-card balance-card--pending sm:col-span-3">
              <p class="text-xs balance-card__label">{{ m.bookingsUi.pendingToPay }}</p>
              <p class="mt-3 text-2xl md:text-[1.75rem] font-extrabold leading-none balance-card__value">{{ formatCurrency(pendingPaymentAmount) }}</p>
            </div>
          </div>

          <div v-if="isZeroBalance" class="mt-4 rounded-2xl px-4 py-3 balance-empty-state">
            <p class="text-sm font-semibold">{{ m.bookingsUi.balanceNoMovementsTitle }}</p>
            <p class="text-xs mt-0.5">{{ m.bookingsUi.balanceNoMovementsSubtitle }}</p>
          </div>
        </section>

        <!-- SECCIÓ: Actives i pendents -->
        <section v-if="activeAndPendingBookings.length > 0" class="mb-10">
          <h2 class="text-xs font-semibold uppercase tracking-wider mb-3" style="color:var(--app-muted-text)">{{ m.bookingsUi.sectionUpcoming }}</h2>
          <div class="space-y-4">
            <div
              v-for="booking in activeAndPendingBookings"
              :key="booking.id"
              class="rounded-2xl overflow-hidden shadow-sm"
              style="background:var(--app-card-bg);border:1.5px solid var(--app-card-border);"
            >
              <!-- Barra d'estat de color -->
              <div class="h-1 w-full" :style="getStatusBarStyle(booking.status)"></div>

              <div class="p-4">
                <!-- Fila principal: vehicle + estat -->
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :style="{background: 'var(--app-surface-alt)'}">
                      <svg class="h-5 w-5" :style="getStatusIconStyle(booking.status)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-bold" style="color:var(--app-text)">{{ booking.vehicle?.license_plate || '—' }}</p>
                      <p class="text-sm" style="color:var(--app-muted-text)">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}</p>
                    </div>
                  </div>
                  <span class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" :style="getStatusBadgeStyle(booking.status)">{{ getStatusLabel(booking.status) }}</span>
                </div>

                <!-- Info contextual -->
                <div v-if="booking.status === 'active'" class="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 border" style="background:var(--app-surface-alt);border-color:var(--app-border);">
                  <span class="w-2 h-2 rounded-full animate-pulse shrink-0" style="background:var(--fleetly-baltic-blue);"></span>
                  <span class="text-xs font-bold" style="color:var(--app-text)">{{ m.bookingsUi.activeVehicleInUse }}</span>
                  <span v-if="booking.trip?.engine_started_at" class="text-xs font-semibold ml-auto" style="color:var(--app-text)">{{ m.bookingsUi.activeSince }} {{ formatTimeOnly(booking.trip.engine_started_at) }}</span>
                </div>

                <div
                  v-else-if="booking.status === 'pending'"
                  class="flex items-center gap-2 mb-3 rounded-xl px-3 py-2 border"
                  :style="isDeadlineNear(booking)
                    ? 'background:color-mix(in srgb, #ef4444 14%, var(--app-surface));border-color:#ef4444;'
                    : 'background:var(--app-surface-alt);border-color:var(--app-border);'"
                >
                  <svg
                    class="h-4 w-4 shrink-0"
                    :style="isDeadlineNear(booking) ? 'color:#b91c1c' : 'color:var(--app-muted-text)'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span class="text-xs font-semibold" style="color:var(--app-text)">{{ timeUntilStart(booking) }}</span>
                  <span
                    v-if="booking.activation_deadline"
                    class="text-xs ml-auto"
                    :style="isDeadlineNear(booking) ? 'color:var(--app-text)' : 'color:var(--app-muted-text)'"
                  >{{ m.bookingsUi.activateUntil }} {{ formatTimeOnly(booking.activation_deadline) }}</span>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="rounded-xl p-2.5" style="background:var(--app-surface-alt);border:1px solid var(--app-border);">
                    <p class="text-xs mb-0.5" style="color:var(--app-muted-text)">{{ m.bookingsUi.start }}</p>
                    <p class="text-xs font-semibold" style="color:var(--app-text)">{{ formatDateCompact(booking.scheduled_start) }}</p>
                  </div>
                  <div v-if="booking.scheduled_end" class="rounded-xl p-2.5" style="background:var(--app-surface-alt);border:1px solid var(--app-border);">
                    <p class="text-xs mb-0.5" style="color:var(--app-muted-text)">{{ m.bookingsUi.end }}</p>
                    <p class="text-xs font-semibold" style="color:var(--app-text)">{{ formatDateCompact(booking.scheduled_end) }}</p>
                  </div>
                </div>

                <!-- Accions -->
                <div class="flex gap-2">
                  <button
                    v-if="booking.status === 'pending'"
                    @click="initCancelBooking(booking.id)"
                    class="flex-1 text-sm font-semibold py-2 rounded-xl transition-colors"
                    style="background:color-mix(in srgb, #ef4444 14%, var(--app-surface));color:#b91c1c;border:1px solid color-mix(in srgb, #ef4444 45%, transparent);"
                  >{{ m.bookingsUi.cancel }}</button>
                  <button
                    @click="viewDetails(booking)"
                    class="flex-1 text-sm font-semibold py-2 rounded-xl transition-colors"
                    style="background:var(--app-surface-alt);color:var(--app-text);border:1px solid var(--app-border);"
                  >{{ m.bookingsUi.details }}</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓ: Completades -->
        <section v-if="completedBookings.length > 0" class="mb-10">
          <h2 class="text-xs font-semibold uppercase tracking-wider mb-4" style="color:var(--app-muted-text)">{{ m.bookingsUi.sectionHistory }}</h2>
          <div class="space-y-3">
            <div
              v-for="booking in completedBookings"
              :key="booking.id"
              class="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-colors history-card"
              style="background:var(--app-card-bg);border:1px solid var(--app-card-border);"
              @click="viewDetails(booking)"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:color-mix(in srgb, #10b981 16%, var(--app-surface));">
                <svg class="h-4 w-4" style="color:#10b981" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-base truncate" style="color:var(--app-text)">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}</p>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span class="history-meta history-meta--code">{{ booking.vehicle?.license_plate || '—' }}</span>
                  <span class="history-meta">{{ formatDateOnly(booking.scheduled_start) }}</span>
                  <span class="history-meta">{{ formatTimeOnly(booking.scheduled_start) }}</span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="font-bold text-sm" style="color:var(--app-text)">{{ getBookingPrice(booking) !== 'Pendent' ? getBookingPrice(booking) + '€' : '—' }}</p>
                <span class="inline-flex mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full history-status history-status--completed">{{ m.bookingsUi.completed }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓ: Cancel·lades (col·lapsable) -->
        <section v-if="cancelledBookings.length > 0">
          <button
            @click="showCancelled = !showCancelled"
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3 transition-colors"
            style="color:var(--app-muted-text)"
          >
            <svg class="h-3.5 w-3.5 transition-transform duration-200" :class="showCancelled ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
            {{ m.bookingsUi.sectionCancelled }} ({{ cancelledBookings.length }})
          </button>
          <Transition name="fade">
            <div v-if="showCancelled" class="space-y-3">
              <div
                v-for="booking in cancelledBookings"
                :key="booking.id"
                class="rounded-2xl p-4 flex items-center gap-4 opacity-80 cursor-pointer hover:opacity-95 transition-opacity history-card"
                style="background:var(--app-card-bg);border:1px solid var(--app-card-border);"
                @click="viewDetails(booking)"
              >
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:var(--app-surface-alt)">
                  <svg class="h-4 w-4" style="color:var(--app-muted-text)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-base truncate" style="color:var(--app-text)">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span class="history-meta history-meta--code">{{ booking.vehicle?.license_plate || '—' }}</span>
                    <span class="history-meta">{{ formatDateOnly(booking.scheduled_start) }}</span>
                    <span class="history-meta">{{ formatTimeOnly(booking.scheduled_start) }}</span>
                  </div>
                </div>
                <span class="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full history-status history-status--cancelled">{{ m.bookingsUi.cancelled }}</span>
              </div>
            </div>
          </Transition>
        </section>
      </template>
    </div>

    <!-- Modal confirmar cancel·lació -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4" @click.self="showCancelModal = false">
          <div class="fixed inset-0 bg-black/50"></div>
          <div class="relative bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-sm p-6" @click.stop>
            <div class="md:hidden w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div class="w-12 h-12 bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white text-center mb-1">{{ m.bookingsUi.confirmCancelTitle }}</h3>
            <p class="text-sm text-gray-400 text-center mb-6">{{ m.bookingsUi.confirmCancelText }}</p>
            <div class="flex gap-3">
              <button @click="showCancelModal = false" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors">
                {{ m.bookingsUi.back }}
              </button>
              <button @click="confirmCancelBooking" :disabled="bookingStore.loading" class="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {{ bookingStore.loading ? '...' : m.bookingsUi.yesCancel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal detalls reserva -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailsModal && selectedBooking" class="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4" @click.self="closeDetailsModal">
          <div class="fixed inset-0 bg-black/50"></div>
          <div class="relative bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md max-h-[85dvh] flex flex-col" @click.stop>
            <div class="md:hidden w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-1 shrink-0"></div>

            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700 shrink-0">
              <div>
                <h3 class="font-bold text-white">{{ m.bookingsUi.bookingNumber }} #{{ selectedBooking.id }}</h3>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="getStatusBadgeStyle(selectedBooking.status)">{{ getStatusLabel(selectedBooking.status) }}</span>
              </div>
              <button @click="closeDetailsModal" class="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Cos -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <!-- Vehicle -->
              <div class="bg-gray-700/50 rounded-2xl p-4 flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </div>
                <div>
                  <p class="font-bold text-white">{{ selectedBooking.vehicle?.license_plate || 'N/A' }}</p>
                  <p class="text-sm text-gray-400">{{ selectedBooking.vehicle?.brand }} {{ selectedBooking.vehicle?.model }}</p>
                </div>
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-gray-800 rounded-xl p-3">
                  <p class="text-xs text-gray-400 mb-1">{{ m.bookingsUi.scheduledStart }}</p>
                  <p class="text-sm font-semibold text-white">{{ formatDate(selectedBooking.scheduled_start) }}</p>
                </div>
                <div class="bg-gray-800 rounded-xl p-3">
                  <p class="text-xs text-gray-400 mb-1">{{ m.bookingsUi.scheduledEnd }}</p>
                  <p class="text-sm font-semibold text-white">{{ formatDate(selectedBooking.scheduled_end) }}</p>
                </div>
                <div v-if="selectedBooking.activation_deadline" class="bg-gray-800 rounded-xl p-3">
                  <p class="text-xs text-gray-400 mb-1">{{ m.bookingsUi.activationLimit }}</p>
                  <p class="text-sm font-semibold text-white">{{ formatDate(selectedBooking.activation_deadline) }}</p>
                </div>
                <div v-if="selectedBooking.trip?.engine_started_at" class="bg-gray-800 rounded-xl p-3">
                  <p class="text-xs text-gray-400 mb-1">{{ m.bookingsUi.realStart }}</p>
                  <p class="text-sm font-semibold text-white">{{ formatDate(selectedBooking.trip.engine_started_at) }}</p>
                </div>
                <div v-if="selectedBooking.cancelled_at" class="col-span-2 bg-red-900/20 rounded-xl p-3">
                  <p class="text-xs text-red-400 mb-1">{{ m.bookingsUi.cancelledOn }}</p>
                  <p class="text-sm font-semibold text-red-300">{{ formatDate(selectedBooking.cancelled_at) }}</p>
                </div>
              </div>

              <!-- Preu -->
              <div class="bg-indigo-900/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p class="text-xs text-indigo-400 mb-0.5">{{ getBookingPriceLabel(selectedBooking) }}</p>
                  <p v-if="selectedBooking.trip?.minutes_driven" class="text-xs text-indigo-400">{{ selectedBooking.trip.minutes_driven }} {{ m.bookingsUi.minutesDriven }}</p>
                </div>
                <span v-if="getBookingPrice(selectedBooking) === m.bookingsUi.pendingPrice" class="text-sm font-semibold text-yellow-500">{{ m.bookingsUi.pendingPriceMsg }}</span>
                <span v-else class="text-2xl font-bold text-indigo-400">{{ getBookingPrice(selectedBooking) }}€</span>
              </div>
            </div>

            <!-- Footer -->
            <div v-if="selectedBooking.status === 'pending'" class="shrink-0 px-5 pb-5 pt-3 border-t border-gray-700">
              <button @click="initCancelBooking(selectedBooking.id)" class="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 font-semibold py-3 rounded-xl transition-colors">
                {{ m.bookingsUi.cancelThisBooking }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBookingStore } from '@/stores/bookingStore'
import { toast } from 'vue3-toastify'
import { useI18n } from '@/i18n'
import { useAuth } from '@/modules/auth/composables/useAuth'

const bookingStore = useBookingStore()
const { m, locale } = useI18n()
const { user, fetchUser } = useAuth()

const showCancelModal = ref(false)
const showDetailsModal = ref(false)
const showCancelled = ref(false)
const selectedBooking = ref<any>(null)
const bookingIdToCancel = ref<number | null>(null)
const countdownInterval = ref<number | null>(null)
const expiredBookings = ref<Set<number>>(new Set())

const walletBalance = computed(() => {
  const value = Number(user.value?.wallet_balance ?? 0)
  return Number.isFinite(value) ? value : 0
})

const activeAndPendingBookings = computed(() =>
  bookingStore.bookings
    .filter(b => ['active', 'pending', 'confirmed'].includes(b.status))
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
)
const completedBookings = computed(() =>
  bookingStore.bookings
    .filter(b => b.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime())
)
const cancelledBookings = computed(() =>
  bookingStore.bookings
    .filter(b => b.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime())
)

const amountForBooking = (booking: any): number => {
  const source = booking.trip?.total_amount ?? booking.total_price ?? booking.cancellation_fee ?? 0
  const parsed = Number(source)
  return Number.isFinite(parsed) ? parsed : 0
}

const totalPaidAmount = computed(() =>
  bookingStore.bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, booking) => sum + amountForBooking(booking), 0)
)

const pendingPaymentAmount = computed(() =>
  bookingStore.bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status) && b.payment_status !== 'paid')
    .reduce((sum, booking) => sum + amountForBooking(booking), 0)
)

const isZeroBalance = computed(() =>
  walletBalance.value === 0 && totalPaidAmount.value === 0 && pendingPaymentAmount.value === 0
)

onMounted(async () => {
  await fetchUser()
  try {
    await bookingStore.fetchBookings()
  } catch {
    toast.error(m.value.bookingsUi.fetchError)
    return
  }
  countdownInterval.value = window.setInterval(async () => {
    const now = new Date()
    for (const booking of bookingStore.bookings) {
      if (booking.status === 'pending' && booking.activation_deadline) {
        const deadline = new Date(booking.activation_deadline)
        if (now >= deadline && !expiredBookings.value.has(booking.id)) {
          expiredBookings.value.add(booking.id)
          toast.warning(m.value.bookingsUi.expiredBookingToast.replace('{vehicle}', booking.vehicle?.license_plate || 'vehicle'))
          try { await bookingStore.fetchBookings() } catch {}
        }
      }
    }
  }, 10000)
})

onUnmounted(() => {
  if (countdownInterval.value) clearInterval(countdownInterval.value)
})

function initCancelBooking(id: number) {
  bookingIdToCancel.value = id
  showDetailsModal.value = false
  showCancelModal.value = true
}

async function confirmCancelBooking() {
  if (!bookingIdToCancel.value) return
  try {
    await bookingStore.cancelBooking(bookingIdToCancel.value)
    toast.success(m.value.bookingsUi.cancelledToast)
    await bookingStore.fetchBookings()
    showCancelModal.value = false
    bookingIdToCancel.value = null
  } catch (error: any) {
    toast.error(error.response?.data?.message || m.value.bookingsUi.cancelError)
  }
}

function viewDetails(booking: any) {
  selectedBooking.value = booking
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedBooking.value = null
}

function getLocaleCode() {
  if (locale.value === 'es') return 'es-ES'
  if (locale.value === 'en') return 'en-GB'
  return 'ca-ES'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(getLocaleCode(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateCompact(dateString: string) {
  const d = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)
  const time = d.toLocaleTimeString(getLocaleCode(), { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === today.toDateString()) return `${m.value.bookingsUi.today} ${time}`
  if (d.toDateString() === tomorrow.toDateString()) return `${m.value.bookingsUi.tomorrow} ${time}`
  return d.toLocaleDateString(getLocaleCode(), { day: '2-digit', month: '2-digit' }) + ' ' + time
}

function formatDateOnly(dateString: string) {
  return new Date(dateString).toLocaleDateString(getLocaleCode(), { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTimeOnly(dateString: string) {
  return new Date(dateString).toLocaleTimeString(getLocaleCode(), { hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(getLocaleCode(), {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value)
}

function timeUntilStart(booking: any): string {
  const diffMs = new Date(booking.scheduled_start).getTime() - Date.now()
  if (diffMs <= 0) return m.value.bookingsUi.startsInPast
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return m.value.bookingsUi.startsInMinutes.replace('{min}', String(diffMin))
  const h = Math.floor(diffMin / 60)
  const minRemainder = diffMin % 60
  if (h < 24) return m.value.bookingsUi.startsInHours
    .replace('{hours}', String(h))
    .replace('{minutes}', minRemainder > 0 ? ` ${minRemainder}min` : '')
  const days = Math.floor(h / 24)
  return m.value.bookingsUi.startsInDays
    .replace('{days}', String(days))
    .replace('{plural}', days > 1 ? 's' : '')
}

function isDeadlineNear(booking: any): boolean {
  if (!booking.activation_deadline) return false
  const diffMin = (new Date(booking.activation_deadline).getTime() - Date.now()) / 60000
  return diffMin < 30 && diffMin > 0
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: m.value.bookingsUi.pending,
    active: m.value.bookingsUi.active,
    completed: m.value.bookingsUi.completedStatus,
    cancelled: m.value.bookingsUi.cancelledStatus,
    confirmed: m.value.bookingsUi.confirmed,
  }
  return labels[status] ?? status
}

function getStatusTone(status: string): string {
  const tones: Record<string, string> = {
    active: 'var(--fleetly-baltic-blue)',
    confirmed: 'var(--fleetly-baltic-blue)',
    pending: '#d97706',
    completed: '#059669',
    cancelled: '#dc2626',
  }
  return tones[status] ?? 'var(--fleetly-baltic-blue)'
}

function getStatusBarStyle(status: string): string {
  const tone = getStatusTone(status)
  return `background:color-mix(in srgb, ${tone} 68%, var(--app-card-border));`
}

function getStatusIconStyle(status: string): string {
  const tone = getStatusTone(status)
  return `color:color-mix(in srgb, ${tone} 74%, var(--app-text));`
}

function getStatusBadgeStyle(status: string): string {
  const tone = getStatusTone(status)
  return `background:color-mix(in srgb, ${tone} 18%, var(--app-surface));color:var(--app-text);border:1px solid color-mix(in srgb, ${tone} 45%, var(--app-border));`
}

function getBookingPrice(booking: any): string {
  if (booking.trip?.total_amount != null) return booking.trip.total_amount.toFixed(2)
  if (booking.total_price != null) return booking.total_price.toFixed(2)
  if (booking.cancellation_fee != null) return booking.cancellation_fee.toFixed(2)
  if (['pending', 'active'].includes(booking.status)) return m.value.bookingsUi.pendingPrice
  return '0.00'
}

function getBookingPriceLabel(booking: any): string {
  if (['pending', 'active'].includes(booking.status)) return m.value.bookingsUi.estimatedPrice
  if (booking.status === 'cancelled' && booking.cancellation_fee != null) return m.value.bookingsUi.cancellationFee
  return m.value.bookingsUi.totalPrice
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active > div:last-child, .modal-leave-active > div:last-child { transition: transform 0.3s ease; }
.modal-enter-from > div:last-child, .modal-leave-to > div:last-child { transform: translateY(100%); }
@media (min-width: 768px) {
  .modal-enter-from > div:last-child, .modal-leave-to > div:last-child { transform: scale(0.95) translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

.balance-panel {
  border: 1px solid var(--app-border);
  background: var(--app-surface-alt);
}

.balance-panel__title {
  color: var(--fleetly-baltic-blue);
  font-weight: 700;
}

.balance-panel__subtitle {
  color: var(--app-muted-text);
}

.balance-card {
  border-width: 1px;
  border-style: solid;
  color: var(--app-text);
}

.balance-card__label {
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--app-muted-text);
}

.balance-card__value {
  color: var(--app-text);
}

.balance-card__value--primary {
  letter-spacing: -0.01em;
}

.balance-card--available {
  border-color: #7dd3fc;
  background: color-mix(in srgb, #7dd3fc 20%, var(--app-surface));
}

.balance-card--available .balance-card__value {
  color: #0369a1;
}

.balance-card--paid {
  border-color: #6ee7b7;
  background: color-mix(in srgb, #6ee7b7 18%, var(--app-surface));
}

.balance-card--paid .balance-card__value {
  color: #047857;
}

.balance-card--pending {
  border-color: #fbbf24;
  background: color-mix(in srgb, #fbbf24 18%, var(--app-surface));
}

.balance-card--pending .balance-card__value {
  color: #b45309;
}

.balance-empty-state {
  border: 1px dashed color-mix(in srgb, var(--app-border) 80%, #38bdf8 20%);
  background: color-mix(in srgb, var(--app-surface) 76%, #0ea5e9 24%);
  color: var(--app-text);
}

.history-card {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-card-border) 85%, transparent);
}

.history-meta {
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid var(--app-border);
  background: var(--app-surface-alt);
  color: var(--app-text);
  font-weight: 600;
}

.history-meta--code {
  color: var(--app-muted-text);
  font-weight: 500;
}

.history-status {
  border: 1px solid transparent;
}

.history-status--completed {
  color: #065f46;
  background: color-mix(in srgb, #10b981 16%, var(--app-surface));
  border-color: color-mix(in srgb, #10b981 40%, transparent);
}

.history-status--cancelled {
  color: #991b1b;
  background: color-mix(in srgb, #ef4444 14%, var(--app-surface));
  border-color: color-mix(in srgb, #ef4444 42%, transparent);
}

:global(html.dark) .balance-card--available {
  border-color: color-mix(in srgb, #38bdf8 42%, var(--app-border));
  background: color-mix(in srgb, #38bdf8 12%, var(--app-surface));
  color: var(--app-text);
}

:global(html.dark) .balance-card--available .balance-card__label {
  color: var(--app-muted-text);
}

:global(html.dark) .balance-card--available .balance-card__value {
  color: #7dd3fc;
}

:global(html.dark) .balance-card--paid {
  border-color: color-mix(in srgb, #10b981 40%, var(--app-border));
  background: color-mix(in srgb, #10b981 12%, var(--app-surface));
  color: var(--app-text);
}

:global(html.dark) .balance-card--paid .balance-card__label {
  color: var(--app-muted-text);
}

:global(html.dark) .balance-card--paid .balance-card__value {
  color: #34d399;
}

:global(html.dark) .balance-card--pending {
  border-color: color-mix(in srgb, #f59e0b 44%, var(--app-border));
  background: color-mix(in srgb, #f59e0b 12%, var(--app-surface));
  color: var(--app-text);
}

:global(html.dark) .balance-card--pending .balance-card__label {
  color: var(--app-muted-text);
}

:global(html.dark) .balance-card--pending .balance-card__value {
  color: #fbbf24;
}

:global(html.dark) .balance-panel {
  border-color: #3b4b66;
  background: color-mix(in srgb, var(--app-surface) 78%, #1f2937 22%);
}

:global(html.dark) .balance-panel__title {
  color: var(--app-text);
}

:global(html.dark) .balance-panel__subtitle {
  color: #cbd5e1;
}

:global(html.dark) .balance-empty-state {
  border-color: color-mix(in srgb, #38bdf8 44%, var(--app-border));
  background: color-mix(in srgb, #0ea5e9 10%, var(--app-surface));
}

:global(html.dark) .history-meta {
  border-color: color-mix(in srgb, var(--app-border) 80%, #475569 20%);
  background: color-mix(in srgb, var(--app-surface) 80%, #334155 20%);
  color: #e2e8f0;
}

:global(html.dark) .history-meta--code {
  color: #94a3b8;
}

:global(html.dark) .history-status--completed {
  color: #34d399;
}

:global(html.dark) .history-status--cancelled {
  color: #f87171;
}
</style>
