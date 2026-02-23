export interface      Permission {
  id: number
  name: string
  description?: string
  module: string
}

export interface PermissionGroup {
  module: string
  permissions: Permission[]
}

export interface Role {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface RoleForm {
  name: string
  permissions: number[]
}

export interface RoleFilters {
  search?: string
}

export interface RolePagination {
  data: Role[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
