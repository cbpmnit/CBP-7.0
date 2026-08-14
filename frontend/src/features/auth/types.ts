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
  accountSetupCompleted?: boolean
  profileCompleted?: boolean
}

export interface CompleteAccountRequest {
  studentId: string
  password: string
  confirmPassword: string
}

export interface SetupPasswordRequest {
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
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
  accountSetupCompleted?: boolean
  profileCompleted?: boolean
}
