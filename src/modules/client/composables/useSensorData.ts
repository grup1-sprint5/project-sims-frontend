import { computed, onBeforeUnmount, ref } from 'vue'
import api from '@/services/api'

export type SensorReading = {
  id?: string
  device_id: string
  sensor_type: string
  value: number
  unit?: string
  timestamp?: string
  created_at?: string
}

type ApiSuccess<T> = { success: true; data: T }

type ApiFailure = { success: false; message?: string }

export function useSensorData(pollIntervalMs: number = 2000) {
  const devices = ref<string[]>([])
  const selectedDeviceId = ref<string>('')
  const latest = ref<SensorReading | null>(null)

  const loadingDevices = ref(false)
  const loadingLatest = ref(false)
  const error = ref<string | null>(null)

  const lastUpdatedAt = ref<Date | null>(null)

  let pollTimer: number | null = null

  const hasDevices = computed(() => devices.value.length > 0)

  const fetchDevices = async () => {
    loadingDevices.value = true
    error.value = null
    try {
      const res = await api.get<ApiSuccess<string[]> | ApiFailure>('/sensor-data/devices')
      const data: any = res.data
      if (!data?.success) throw new Error(data?.message || 'Error loading devices')

      devices.value = Array.isArray(data.data) ? data.data : []
      if (!selectedDeviceId.value && devices.value.length > 0) {
        selectedDeviceId.value = devices.value[0] ?? ''
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error loading devices'
      devices.value = []
    } finally {
      loadingDevices.value = false
    }
  }

  const fetchLatest = async () => {
    if (!selectedDeviceId.value) {
      latest.value = null
      return
    }

    loadingLatest.value = true
    error.value = null

    try {
      const res = await api.get<ApiSuccess<SensorReading> | ApiFailure>(
        `/sensor-data/devices/${encodeURIComponent(selectedDeviceId.value)}/latest`
      )
      const data: any = res.data
      if (!data?.success) throw new Error(data?.message || 'No latest reading')

      latest.value = data.data ?? null
      lastUpdatedAt.value = new Date()
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error loading latest reading'
    } finally {
      loadingLatest.value = false
    }
  }

  const startPolling = () => {
    stopPolling()
    void fetchLatest()
    pollTimer = window.setInterval(() => {
      void fetchLatest()
    }, pollIntervalMs)
  }

  const stopPolling = () => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
  }

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    devices,
    selectedDeviceId,
    latest,
    hasDevices,
    loadingDevices,
    loadingLatest,
    error,
    lastUpdatedAt,
    fetchDevices,
    fetchLatest,
    startPolling,
    stopPolling,
  }
}
