import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuth } from '@/modules/auth/composables/useAuth'
import type { User, UserForm, UserFilters, UserPagination } from '../interfaces/user.interface'

export function useUsers() {
  const { user: currentUser } = useAuth()
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  })

  const isCurrentUserAdmin = computed(() => {
    return currentUser.value?.roles?.some((role: any) => role.name === 'Admin') ?? false
  })

  const getUsers = async (page = 1, filters: UserFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<User[]>('/users')
      let filteredUsers = response.data

      // Filter by search if present
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.username.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        )
      }

      // Filter by active status if defined
      if (filters.active !== undefined) {
        filteredUsers = filteredUsers.filter((user) => user.active === filters.active)
      }

      // Calculate pagination
      const perPage = pagination.value.per_page
      const total = filteredUsers.length
      const lastPage = Math.max(1, Math.ceil(total / perPage))
      const currentPage = Math.min(page, lastPage)
      const start = (currentPage - 1) * perPage
      const end = start + perPage

      users.value = filteredUsers.slice(start, end)
      pagination.value = {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total: total
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading users'
      console.error('Error loading users:', err)
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data: UserForm) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data: User; message: string }>('/users', data)
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, data: Partial<UserForm>) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data: User; message: string }>(`/users/${id}`, data)
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error updating user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/users/${id}`)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error deleting user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUser = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data: User }>(`/users/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error fetching user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    pagination,
    isCurrentUserAdmin,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser
  }
}
