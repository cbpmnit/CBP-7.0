export interface LoginRequest {
  identifier?: string
  studentId?: string
  password: string
}

export interface LoginResponse {
  token: string
  studentId: string
  name: string
  role: string
  permissions?: string[]
}

export interface UserResponse {
  id?: string
  studentId: string
  email: string
  name: string
  phoneNumber?: string
  role: string
  permissions?: string[]
}
