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
      // Filter to only show pending requests
      requests.value = requests.value.filter((r: any) => r.status === 'pending')
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Failed to load requests'
    } finally {
      loading.value = false
    }
  }

  const approve = async (id: number) => {
    try {
      const res = await api.post(`/tenant-requests/${id}/approve`)
      // Reload to get updated list
      await new Promise(resolve => setTimeout(resolve, 500))
      await load()
      return res.data
    } catch (e: any) {
      throw e
    }
  }

  return { loading, error, requests, load, approve }
}
