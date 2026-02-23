<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="mb-6">
      <router-link
        to="/admin/bookings"
        class="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center text-gray-500 dark:text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Loading booking...
      </div>
    </div>

    <div v-else-if="error" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="booking" class="bg-white dark:bg-gray-900 shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Booking #{{ booking.id }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Full booking information
          </p>
        </div>
        <div class="flex gap-3">
          <router-link
            :to="`/admin/bookings/${booking.id}/edit`"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            Edit
          </router-link>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Guest</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <span v-if="booking.user">{{ booking.user.name }} ({{ booking.user.email }})</span>
              <span v-else>User #{{ booking.user_id ?? '-' }}</span>
            </dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <span v-if="booking.vehicle">
                {{ booking.vehicle.brand }} {{ booking.vehicle.model }} - {{ booking.vehicle.license_plate }}
              </span>
              <span v-else>Vehicle #{{ booking.vehicle_id ?? '-' }}</span>
            </dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  booking.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                ]"
              >
                {{ booking.status }}
              </span>
            </dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <div v-if="booking.scheduled_start">
                {{ formatDateTime(booking.scheduled_start) }}
              </div>
              <div v-else class="text-gray-400">-</div>
            </dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total price</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <span v-if="booking.total_price != null">{{ formatCurrency(booking.total_price) }}</span>
              <span v-else class="text-gray-400">-</span>
            </dd>
          </div>

          <div class="sm:col-span-1" v-if="booking.trip">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Trip</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ booking.trip.minutes_driven }} min · {{ formatCurrency(booking.trip.total_amount) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBookings } from '../composables/useBookings'
import type { Booking } from '../interfaces/booking.interface'

const route = useRoute()
const { currentBooking, getBooking, loading, error } = useBookings()

const booking = computed<Booking | null>(() => currentBooking.value)

const bookingId = ref<number>(Number(route.params.id))

onMounted(async () => {
  if (bookingId.value) {
    try {
      await getBooking(bookingId.value)
    } catch (e) {
      // error state is handled by composable
    }
  }
})

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('es-ES')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}
</script>
