export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}
