export interface LoginRequest {
  identifier?: string
  studentId?: string
  password: string
}

export interface LoginResponse {
  token: string
  id?: string
  userId?: string
  studentId: string
  name: string
  role: string
  roles?: string[]
  permissions?: string[]
}

export interface RegisterRequest {
  studentId: string
  name: string
  email: string
  password?: string
  phoneNumber?: string
  department?: string
  year?: number
}

export interface UserResponse {
  id?: string
  userId?: string
  studentId: string
  email: string
  name: string
  phoneNumber?: string
  role: string
  roles?: string[]
  permissions?: string[]
}
