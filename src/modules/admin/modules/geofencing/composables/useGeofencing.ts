import { ref } from 'vue'
import { useI18n } from '@/i18n'
import { geofencingApi } from '../services/geofencing.api'
import type {
  AssignmentPayload,
  CreateGeofencePayload,
  Geofence,
  GeofenceAssignment,
  GeofenceEvent,
  GeofenceEventsFilters,
  GeofenceEventsResponse,
  GeofenceFilters,
  GeofenceListResponse,
  VehiclePositionPayload,
} from '../interfaces/geofencing.interface'

interface PaginationState {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const defaultPagination = (): PaginationState => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const unwrapPagination = <T>(payload: any): { items: T[]; pagination: PaginationState } => {
  if (Array.isArray(payload)) {
    return { items: payload, pagination: { ...defaultPagination(), total: payload.length } }
  }

  if (Array.isArray(payload?.data)) {
    return {
      items: payload.data,
      pagination: {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        per_page: payload.per_page ?? payload.data.length ?? 15,
        total: payload.total ?? payload.data.length ?? 0,
      },
    }
  }

  if (Array.isArray(payload?.data?.data)) {
    const data = payload.data
    return {
      items: data.data,
      pagination: {
        current_page: data.current_page ?? 1,
        last_page: data.last_page ?? 1,
        per_page: data.per_page ?? data.data.length ?? 15,
        total: data.total ?? data.data.length ?? 0,
      },
    }
  }

  return { items: [], pagination: defaultPagination() }
}

export function useGeofencing() {
  const { m } = useI18n()

  const readMessageFromError = (error: any, fallback: string) => {
    if (error?.response?.status === 400) {
      return error?.response?.data?.message || m.value.adminGeofencesUi.tenantMissing
    }
    if (error?.response?.status === 401) return m.value.adminGeofencesUi.unauthorized
    if (error?.response?.status === 403) return m.value.adminGeofencesUi.forbidden
    if (error?.response?.status === 422) {
      const firstValidationError = Object.values(error?.response?.data?.errors || {})[0] as string[] | undefined
      if (firstValidationError?.length) return firstValidationError[0]
      return error?.response?.data?.message || m.value.adminGeofencesUi.validationFailed
    }
    if (error?.response?.status >= 500) return m.value.adminGeofencesUi.serverError
    return error?.response?.data?.message || fallback
  }

  const geofences = ref<Geofence[]>([])
  const geofence = ref<Geofence | null>(null)
  const events = ref<GeofenceEvent[]>([])

  const loading = ref(false)
  const saving = ref(false)
  const ingesting = ref(false)
  const error = ref<string | null>(null)

  const geofencePagination = ref<PaginationState>(defaultPagination())
  const eventsPagination = ref<PaginationState>(defaultPagination())

  const getGeofences = async (filters: GeofenceFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, unknown> = {
        page: filters.page ?? geofencePagination.value.current_page,
      }

      if (filters.active !== '' && filters.active !== undefined) params.active = filters.active
      if (filters.name) params.name = filters.name
      if (filters.assign_type) params.assign_type = filters.assign_type
      if (filters.assign_id) params.assign_id = filters.assign_id

      const response = await geofencingApi.listGeofences(params as GeofenceFilters)
      const { items, pagination } = unwrapPagination<Geofence>(response)
      geofences.value = items
      geofencePagination.value = pagination
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorLoadingGeofences)
      geofences.value = []
    } finally {
      loading.value = false
    }
  }

  const getGeofence = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      geofence.value = await geofencingApi.getGeofence(id)
      return geofence.value
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorLoadingGeofence)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createGeofence = async (payload: CreateGeofencePayload) => {
    saving.value = true
    error.value = null
    try {
      return await geofencingApi.createGeofence(payload)
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorCreatingGeofence)
      throw err
    } finally {
      saving.value = false
    }
  }

  const updateGeofence = async (id: string, payload: Partial<CreateGeofencePayload>) => {
    saving.value = true
    error.value = null
    try {
      return await geofencingApi.updateGeofence(id, payload)
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorUpdatingGeofence)
      throw err
    } finally {
      saving.value = false
    }
  }

  const deleteGeofence = async (id: string) => {
    saving.value = true
    error.value = null
    try {
      await geofencingApi.deleteGeofence(id)
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorDeletingGeofence)
      throw err
    } finally {
      saving.value = false
    }
  }

  const addAssignment = async (geofenceId: string, payload: AssignmentPayload) => {
    saving.value = true
    error.value = null
    try {
      return await geofencingApi.addAssignment(geofenceId, payload)
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorCreatingAssignment)
      throw err
    } finally {
      saving.value = false
    }
  }

  const deleteAssignment = async (geofenceId: string, assignmentId: string | number) => {
    saving.value = true
    error.value = null
    try {
      await geofencingApi.deleteAssignment(geofenceId, assignmentId)
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorDeletingAssignment)
      throw err
    } finally {
      saving.value = false
    }
  }

  const getEvents = async (filters: GeofenceEventsFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, unknown> = {
        page: filters.page ?? eventsPagination.value.current_page,
      }

      if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id
      if (filters.geofence_id) params.geofence_id = filters.geofence_id
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      if (filters.event_type) params.event_type = filters.event_type

      const response = await geofencingApi.listEvents(params)
      const { items, pagination } = unwrapPagination<GeofenceEvent>(response)
      events.value = items
      eventsPagination.value = pagination
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorLoadingEvents)
      events.value = []
    } finally {
      loading.value = false
    }
  }

  const ingestVehiclePosition = async (payload: VehiclePositionPayload) => {
    ingesting.value = true
    error.value = null
    try {
      return await geofencingApi.ingestVehiclePosition(payload)
    } catch (err: any) {
      error.value = readMessageFromError(err, m.value.adminGeofencesUi.errorIngestPosition)
      throw err
    } finally {
      ingesting.value = false
    }
  }

  return {
    geofences,
    geofence,
    events,
    geofencePagination,
    eventsPagination,
    loading,
    saving,
    ingesting,
    error,
    getGeofences,
    getGeofence,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    addAssignment,
    deleteAssignment,
    getEvents,
    ingestVehiclePosition,
  }
}
