<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Les meves reserves</h1>

      <!-- Secció: Vehicles disponibles -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Vehicles disponibles</h2>
        
        <div v-if="vehicleStore.loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Carregant vehicles...</p>
        </div>

        <div v-else-if="vehicleStore.error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Error carregant vehicles: {{ vehicleStore.error }}
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="vehicle in vehicleStore.availableVehicles"
            :key="vehicle.id"
            @click="openBookingModal(vehicle)"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
          >
            <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-white/80 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span class="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Disponible
              </span>
            </div>
            <div class="p-5">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ vehicle.brand }} {{ vehicle.model }}</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">{{ vehicle.plate }}</p>
              <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Reservar ara
              </button>
            </div>
          </div>
        </div>

        <div v-if="!vehicleStore.loading && vehicleStore.availableVehicles.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">No hi ha vehicles disponibles en aquest moment</p>
        </div>
      </section>

      <!-- Secció: Les meves reserves -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Les meves reserves</h2>
        
        <div v-if="bookingStore.loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>

        <div v-else-if="bookingStore.bookings.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p class="text-gray-600 dark:text-gray-400">Encara no tens cap reserva</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="booking in bookingStore.bookings"
            :key="booking.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ booking.vehicle?.license_plate || 'Vehicle' }}
              </h3>
              <span
                class="px-3 py-1 rounded-full text-sm font-semibold"
                :class="{
                  'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                  'bg-blue-100 text-blue-800': booking.status === 'active',
                  'bg-green-100 text-green-800': booking.status === 'completed',
                  'bg-red-100 text-red-800': booking.status === 'cancelled'
                }"
              >
                {{ getStatusLabel(booking.status) }}
              </span>
            </div>

            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Inici:</strong> {{ formatDate(booking.scheduled_start) }}</p>
              <p v-if="booking.trip"><strong>Fi:</strong> {{ formatDate(booking.trip.engine_started_at) }}</p>
              <p><strong>Estat:</strong> {{ getStatusLabel(booking.status) }}</p>
            </div>

            <div class="mt-4 flex gap-2">
              <button
                v-if="booking.status === 'pending'"
                @click="initCancelBooking(booking.id)"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel·lar
              </button>
              <button
                @click="viewDetails(booking)"
                class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Detalls
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal crear reserva -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showBookingModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeBookingModal">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/50 transition-opacity"></div>
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6" @click.stop>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Reservar {{ selectedVehicle?.brand }} {{ selectedVehicle?.model }}
                </h3>
                <button @click="closeBookingModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form @submit.prevent="submitBooking" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data i hora d'inici
                  </label>
                  <input
                    v-model="bookingForm.scheduled_start"
                    type="datetime-local"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data i hora de fi
                  </label>
                  <input
                    v-model="bookingForm.scheduled_end"
                    type="datetime-local"
                    :min="bookingForm.scheduled_start"
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div v-if="priceInfo" class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Durada:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ priceInfo.total_minutes }} min ({{ priceInfo.hours }}h)</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Tarifa:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ priceInfo.price_per_minute }}€/min (màx {{ priceInfo.max_per_hour }}€/h)</span>
                  </div>
                  <div v-if="priceInfo.base_price !== priceInfo.final_price" class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Preu base:</span>
                    <span class="font-semibold text-gray-500 dark:text-gray-400 line-through">{{ priceInfo.base_price }}€</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-indigo-200 dark:border-indigo-700">
                    <span class="text-base font-bold text-gray-900 dark:text-white">Total:</span>
                    <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ priceInfo.final_price }}€</span>
                  </div>
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="closeBookingModal"
                    class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel·lar
                  </button>
                  <button
                    type="submit"
                    :disabled="bookingStore.loading || !priceInfo"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {{ bookingStore.loading ? 'Creant...' : 'Confirmar reserva' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal confirmar cancel·lació -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCancelModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showCancelModal = false">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/50 transition-opacity"></div>
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Confirmar cancel·lació
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Estàs segur que vols cancel·lar aquesta reserva?
              </p>
              <div class="flex gap-3">
                <button
                  @click="showCancelModal = false"
                  class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel·lar
                </button>
                <button
                  @click="confirmCancelBooking"
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Acceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal detalls reserva -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailsModal && selectedBooking" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeDetailsModal">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/50 transition-opacity"></div>
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6" @click.stop>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalls de la reserva
                </h3>
                <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Vehicle</h4>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ selectedBooking.vehicle?.license_plate || 'N/A' }}
                  </p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Estat</h4>
                  <span
                    class="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                    :class="{
                      'bg-yellow-100 text-yellow-800': selectedBooking.status === 'pending',
                      'bg-blue-100 text-blue-800': selectedBooking.status === 'active',
                      'bg-green-100 text-green-800': selectedBooking.status === 'completed',
                      'bg-red-100 text-red-800': selectedBooking.status === 'cancelled'
                    }"
                  >
                    {{ getStatusLabel(selectedBooking.status) }}
                  </span>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Dates</h4>
                  <div class="space-y-1 text-gray-600 dark:text-gray-400">
                    <p><strong>Inici programat:</strong> {{ formatDate(selectedBooking.scheduled_start) }}</p>
                    <p v-if="selectedBooking.activation_deadline"><strong>Límit activació:</strong> {{ formatDate(selectedBooking.activation_deadline) }}</p>
                    <p v-if="selectedBooking.trip?.engine_started_at"><strong>Inici real:</strong> {{ formatDate(selectedBooking.trip.engine_started_at) }}</p>
                    <p v-if="selectedBooking.cancelled_at"><strong>Cancel·lada:</strong> {{ formatDate(selectedBooking.cancelled_at) }}</p>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ getBookingPriceLabel(selectedBooking) }}</h4>
                  <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    <span v-if="getBookingPrice(selectedBooking) === 'Pendent'" class="text-yellow-600 dark:text-yellow-400">
                      Es calcularà al finalitzar
                    </span>
                    <span v-else>{{ getBookingPrice(selectedBooking) }}€</span>
                  </p>
                  <p v-if="selectedBooking.trip?.minutes_driven" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ selectedBooking.trip.minutes_driven }} minuts conduïts
                  </p>
                </div>
                <div v-if="selectedBooking.status === 'pending'" class="pt-4">
                  <button
                    @click="initCancelBooking(selectedBooking.id)"
                    class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel·lar reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useBookingStore } from '@/stores/bookingStore'
import type { Vehicle } from '@/stores/vehicleStore'
import { toast } from 'vue3-toastify'

const vehicleStore = useVehicleStore()
const bookingStore = useBookingStore()

const showBookingModal = ref(false)
const showCancelModal = ref(false)
const showDetailsModal = ref(false)
const selectedVehicle = ref<Vehicle | null>(null)
const selectedBooking = ref<any>(null)
const bookingIdToCancel = ref<number | null>(null)
const priceInfo = ref<any>(null)

const bookingForm = ref({
  vehicle_id: 0,
  scheduled_start: '',
  scheduled_end: ''
})

const minDateTime = computed(() => {
  const now = new Date()
  // Només 1 minut de marge (el backend ja valida amb +1 minut)
  now.setMinutes(now.getMinutes() + 1)
  // Retornar en format local (YYYY-MM-DDTHH:mm)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

// Actualitzar cada segon per comprovar reserves expirades
const countdownInterval = ref<number | null>(null)
const expiredBookings = ref<Set<number>>(new Set()) // Track de reserves expirades

onMounted(async () => {
  await vehicleStore.fetchVehicles()
  await bookingStore.fetchBookings()
  
  // Actualitzar cada segon per comprovar reserves expirades
  countdownInterval.value = window.setInterval(async () => {
    // Comprovar si alguna reserva pending ha expirat
    const now = new Date()
    
    for (const booking of bookingStore.bookings) {
      if (booking.status === 'pending' && booking.activation_deadline) {
        const deadline = new Date(booking.activation_deadline)
        
        // Si ha expirat i no l'hem marcat abans
        if (now >= deadline && !expiredBookings.value.has(booking.id)) {
          console.log(`Reserva ${booking.id} ha expirat. Refrescant...`)
          expiredBookings.value.add(booking.id)
          
          // Mostrar notificació immediatament
          toast.warning(`La reserva del vehicle ${booking.vehicle?.license_plate || 'N/A'} ha expirat`)
          
          // Intentar refrescar diverses vegades per assegurar que el backend ha processat
          let attempts = 0
          const maxAttempts = 5
          const refreshInterval = setInterval(async () => {
            attempts++
            await bookingStore.fetchBookings()
            
            // Comprovar si la reserva ja està cancel·lada
            const updatedBooking = bookingStore.bookings.find(b => b.id === booking.id)
            if (!updatedBooking || updatedBooking.status === 'cancelled' || attempts >= maxAttempts) {
              clearInterval(refreshInterval)
              if (updatedBooking?.status === 'cancelled') {
                console.log(`Reserva ${booking.id} cancel·lada correctament`)
              }
            }
          }, 3000) // Cada 3 segons durant 15 segons màxim
        }
      }
    }
  }, 1000)
})

// Netejar interval quan es destrueix el component
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})

watch([() => bookingForm.value.scheduled_start, () => bookingForm.value.scheduled_end], async ([start, end]) => {
  if (start && end && new Date(end) > new Date(start)) {
    try {
      priceInfo.value = await bookingStore.calculatePrice(start, end)
    } catch (error) {
      console.error('Error calculant preu:', error)
      priceInfo.value = null
    }
  } else {
    priceInfo.value = null
  }
})

function openBookingModal(vehicle: Vehicle) {
  selectedVehicle.value = vehicle
  bookingForm.value.vehicle_id = vehicle.id
  showBookingModal.value = true
}

function closeBookingModal() {
  showBookingModal.value = false
  selectedVehicle.value = null
  bookingForm.value = {
    vehicle_id: 0,
    scheduled_start: '',
    scheduled_end: ''
  }
  priceInfo.value = null
}

async function submitBooking() {
  try {
    // Com el backend ara treballa amb Europe/Madrid, enviem les dates en format local
    const bookingData = {
      ...bookingForm.value,
      scheduled_start: bookingForm.value.scheduled_start + ':00', // Afegir segons
      scheduled_end: bookingForm.value.scheduled_end + ':00'
    }
    
    await bookingStore.createBooking(bookingData)
    toast.success('Reserva creada correctament!')
    closeBookingModal()
    await bookingStore.fetchBookings()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error creant la reserva')
  }
}

function initCancelBooking(id: number) {
  bookingIdToCancel.value = id
  showCancelModal.value = true
  showDetailsModal.value = false
}

async function confirmCancelBooking() {
  if (!bookingIdToCancel.value) return
  
  try {
    await bookingStore.cancelBooking(bookingIdToCancel.value)
    toast.success('Reserva cancel·lada correctament')
    await bookingStore.fetchBookings()
    showCancelModal.value = false
    bookingIdToCancel.value = null
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error cancel·lant la reserva')
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pendent',
    active: 'Activa',
    completed: 'Completada',
    cancelled: 'Cancel·lada',
    finished: 'Finalitzada'
  }
  return labels[status] || status
}

function getBookingPrice(booking: any): string {
  // Si hi ha preu final del viatge
  if (booking.trip?.total_amount) {
    return booking.trip.total_amount.toFixed(2)
  }
  // Si hi ha preu pre-calculat
  if (booking.total_price) {
    return booking.total_price.toFixed(2)
  }
  // Si hi ha taxa de cancel·lació
  if (booking.cancellation_fee) {
    return booking.cancellation_fee.toFixed(2)
  }
  // Si és pendent o activa, mostrar que es calcularà
  if (booking.status === 'pending' || booking.status === 'active') {
    return 'Pendent'
  }
  return '0.00'
}

function getBookingPriceLabel(booking: any): string {
  if (booking.status === 'pending' || booking.status === 'active') {
    return 'Preu estimat'
  }
  if (booking.status === 'cancelled' && booking.cancellation_fee) {
    return 'Taxa cancel·lació'
  }
  return 'Preu total'
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
