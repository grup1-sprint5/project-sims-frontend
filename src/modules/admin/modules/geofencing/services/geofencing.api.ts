import apiClient from '@/services/api'
import type {
  AssignmentPayload,
  CreateGeofencePayload,
  Geofence,
  GeofenceAssignment,
  GeofenceEvent,
  GeofenceEventsResponse,
  GeofenceFilters,
  GeofenceListResponse,
  VehiclePositionPayload,
  VehiclePositionResponse,
} from '../interfaces/geofencing.interface'

type ApiEnvelope<T> = {
  data?: T
}

const unwrapData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T
  }

  return payload as T
}

export const geofencingApi = {
  async listGeofences(filters: GeofenceFilters) {
    const response = await apiClient.get<GeofenceListResponse>('/geofences', { params: filters })
    return response.data
  },

  async getGeofence(id: string, tenantId?: string | null) {
    const params = tenantId ? { tenant_id: tenantId } : undefined
    const response = await apiClient.get<Geofence | ApiEnvelope<Geofence>>(`/geofences/${id}`, { params })
    return unwrapData(response.data)
  },

  async createGeofence(payload: CreateGeofencePayload) {
    const response = await apiClient.post<Geofence | ApiEnvelope<Geofence>>('/geofences', payload)
    return unwrapData(response.data)
  },

  async updateGeofence(id: string, payload: Partial<CreateGeofencePayload>, tenantId?: string | null) {
    const params = tenantId ? { tenant_id: tenantId } : undefined
    const response = await apiClient.patch<Geofence | ApiEnvelope<Geofence>>(`/geofences/${id}`, payload, { params })
    return unwrapData(response.data)
  },

  async deleteGeofence(id: string, tenantId?: string | null) {
    const params = tenantId ? { tenant_id: tenantId } : undefined
    await apiClient.delete(`/geofences/${id}`, { params })
  },

  async addAssignment(geofenceId: string, payload: AssignmentPayload, tenantId?: string | null) {
    const params = tenantId ? { tenant_id: tenantId } : undefined
    const response = await apiClient.post<GeofenceAssignment | ApiEnvelope<GeofenceAssignment>>(
      `/geofences/${geofenceId}/assignments`,
      payload,
      { params },
    )

    return unwrapData(response.data)
  },

  async deleteAssignment(geofenceId: string, assignmentId: string | number, tenantId?: string | null) {
    const params = tenantId ? { tenant_id: tenantId } : undefined
    await apiClient.delete(`/geofences/${geofenceId}/assignments/${assignmentId}`, { params })
  },

  async listEvents(filters: Record<string, unknown>) {
    const response = await apiClient.get<GeofenceEventsResponse>('/geofence-events', { params: filters })
    return response.data
  },

  async ingestVehiclePosition(payload: VehiclePositionPayload) {
    const response = await apiClient.post<VehiclePositionResponse>('/vehicle-positions', payload)
    return response.data
  },

  async listAllGeofencesForSelect() {
    const response = await apiClient.get<GeofenceListResponse>('/geofences', { params: { page: 1, per_page: 100 } })
    const payload = response.data as any

    if (Array.isArray(payload)) return payload as Geofence[]
    if (Array.isArray(payload?.data)) return payload.data as Geofence[]
    if (Array.isArray(payload?.data?.data)) return payload.data.data as Geofence[]

    return [] as Geofence[]
  },
}

export type { GeofenceEvent }
