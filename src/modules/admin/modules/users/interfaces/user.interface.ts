export interface UserRole {
  id: number
  name: string
}

export interface UserTenant {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  username: string
  email: string
  active: boolean
  roles?: UserRole[]
  tenant?: UserTenant | null
  created_at: string
  updated_at: string
}

export interface UserForm {
  name: string
  username: string
  email: string
  password?: string
  password_confirmation?: string
  active: boolean
  role_id?: number | null
  tenant_id?: number | null
}

export interface UserFilters {
  search?: string
  role?: string
  tenant_id?: number
  active?: boolean
}

export interface UserPagination {
  data: User[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
