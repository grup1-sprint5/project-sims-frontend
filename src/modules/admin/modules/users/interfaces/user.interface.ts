export interface User {
  id: number
  name: string
  username: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
  role: string
}

export interface UserForm {
  name: string
  username: string
  email: string
  password?: string
  active: boolean
  role_id?: number | null
}

export interface UserFilters {
  search?: string
  active?: boolean
}

export interface UserPagination {
  data: User[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
