export interface BookingUser {
  id: number
  name: string
  email: string
}

export interface BookingVehicle {
  id: number
  brand: string
  model: string
  license_plate: string
}

export interface BookingTrip {
  id: number
  engine_started_at: string | null
  total_amount: number
  minutes_driven: number
}

export type BookingStatus = 'active' | 'pending' | 'finished' | 'cancelled' | 'completed'

export interface Booking {
  id: number
  status: BookingStatus
  // Classic booking fields (if returned by backend)
  user_id?: number
  vehicle_id?: number
  start_time?: string
  end_time?: string
  total_price?: number
  created_at?: string

  // Campos del nuevo formato de respuesta
  scheduled_start?: string
  activation_deadline?: string | null
  cancelled_at?: string | null
  cancellation_fee?: number | null
  deleted_at?: string | null
  user?: BookingUser
  vehicle?: BookingVehicle
  trip?: BookingTrip
}

export interface BookingFilters {
  page?: number
  search?: string
  status?: string
}

export interface BookingPagination {
  data: Booking[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Basic payload to create bookings from admin
// El backend solo requiere: vehicle_id y scheduled_start
export interface BookingCreatePayload {
  vehicle_id: number
  scheduled_start: string
  user_id?: number
}
