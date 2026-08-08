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
}

export interface UserResponse {
  studentId: string
  email: string
  name: string
  phoneNumber?: string
  role: string
}
