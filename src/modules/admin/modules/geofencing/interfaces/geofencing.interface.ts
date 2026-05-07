export type GeofenceType = 'polygon' | 'circle'
export type GeofenceRuleType = 'allow' | 'forbid'
export type AssignmentType = 'vehicle' | 'fleet'
export type GeofenceEventType = 'enter' | 'exit' | 'violation'
export type GeofenceScheduleDay = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface GeofencePoint {
  lng: number | null
  lat: number | null
}

export interface GeofenceSchedule {
  timezone: string
  days: GeofenceScheduleDay[]
  start: string
  end: string
}

export interface GeofenceAssignment {
  id: string | number
  geofence_id: string
  assign_type: AssignmentType
  assign_id: string
  created_at?: string
}

export interface Geofence {
  id: string
  tenant_id?: string | number
  name: string
  type: GeofenceType
  rule_type: GeofenceRuleType
  active: boolean
  hysteresis_m: number
  polygon?: number[][]
  coordinates?: number[][]
  geometry_geojson?: {
    type: 'Polygon'
    coordinates: number[][][]
  } | null
  center?: { lat: number; lng: number }
  radius_m?: number
  schedule?: GeofenceSchedule | null
  assignments?: GeofenceAssignment[]
  created_at?: string
  updated_at?: string
}

export interface GeofenceFilters {
  page?: number
  active?: boolean | ''
  name?: string
  assign_type?: AssignmentType | ''
  assign_id?: string
}

export interface GeofenceListResponse {
  data: Geofence[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface GeofenceFormModel {
  name: string
  type: GeofenceType
  rule_type: GeofenceRuleType
  active: boolean
  hysteresis_m: number
  polygonPoints: GeofencePoint[]
  center: { lat: number | null; lng: number | null }
  radius_m: number | null
  scheduleEnabled: boolean
  schedule: GeofenceSchedule
}

export interface CreateGeofencePayload {
  name: string
  type: GeofenceType
  rule_type: GeofenceRuleType
  active: boolean
  hysteresis_m: number
  schedule?: GeofenceSchedule | null
  polygon?: number[][]
  center?: { lat: number; lng: number }
  radius_m?: number
}

export interface AssignmentPayload {
  assign_type: AssignmentType
  assign_id: string
}

export interface GeofenceEvent {
  id: number | string
  geofence_id: string
  vehicle_id: number
  event_type: GeofenceEventType
  position: { lat: number; lng: number }
  occurred_at: string
  metadata?: Record<string, unknown>
}

export interface GeofenceEventsFilters {
  page?: number
  vehicle_id?: number | null
  geofence_id?: string
  from?: string
  to?: string
  event_type?: GeofenceEventType | ''
}

export interface GeofenceEventsResponse {
  data: GeofenceEvent[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface VehiclePositionPayload {
  vehicle_id: number
  lat: number
  lng: number
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface VehiclePositionResponse {
  message: string
  data: {
    events_count: number
    events: GeofenceEvent[]
  }
}

export interface GeofenceValidationErrors {
  name?: string
  type?: string
  hysteresis_m?: string
  polygonPoints?: string
  center?: string
  radius_m?: string
  schedule?: string
}
