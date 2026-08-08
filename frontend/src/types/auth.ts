export interface LoginRequest {
  studentId: string
  password: string
}

export interface LoginResponse {
  token: string
  studentId: string
  name: string
  role: string
}
