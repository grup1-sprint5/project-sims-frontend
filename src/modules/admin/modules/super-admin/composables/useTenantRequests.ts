import { ref } from 'vue'
import api from '@/services/api'

export function useTenantRequests() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const requests = ref<any[]>([])

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/tenant-requests')
      requests.value = res.data?.data || res.data || []
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Failed to load requests'
    } finally {
      loading.value = false
    }
  }

  const approve = async (id: number) => {
    try {
      await api.post(`/tenant-requests/${id}/approve`)
      await load()
    } catch (e: any) {
      throw e
    }
  }

  return { loading, error, requests, load, approve }
}
