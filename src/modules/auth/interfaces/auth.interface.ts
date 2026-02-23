export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterRequest {
  name: string
  username: string
  email: string
  password: string
  role_id: number
}

export interface RegisterResponse extends User {}

export interface Permission {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface User {
  id: number
  name: string
  email: string
  active: boolean
  roles: Role[]
}

export interface UserResponse {
  user: User
}
