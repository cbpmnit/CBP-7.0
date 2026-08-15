import { ProgramLevel, StudentType } from "@/features/profile/types"

export interface PublicRegistrationFormData {
  fullName: string
  studentId: string
  email: string
  mobileNumber: string
  programLevel: ProgramLevel
  department: string
  customDepartment: string
  year: number
  studentType: StudentType
  address: string
  hostelNumber: string
  roomNumber: string
  expectations: string
}

export interface CreatePublicOrderRequest {
  fullName: string
  studentId: string
  email: string
  mobileNumber: string
  programLevel: ProgramLevel
  department: string
  customDepartment?: string | null
  year: number
  studentType: StudentType
  address?: string | null
  hostelNumber?: string | null
  roomNumber?: string | null
  expectations?: string | null
}

export interface PaymentConfigResponse {
  amount: number
  currency: string
}

export interface PublicOrderResponse {
  registrationId: string
  merchantOrderId: string
  amount: number
  redirectUrl: string
  paymentStatus: string
}

export interface CompletePublicRegistrationRequest {
  registrationId: string
  merchantOrderId: string
  gatewayTransactionId?: string
}

export interface PublicRegistrationStatusResponse {
  registrationId: string
  fullName: string
  studentId: string
  email: string
  mobileNumber: string
  programLevel: string
  department: string
  year: number
  studentType: string
  paymentStatus: string
  paymentTransactionId: string
  amount?: number
  createdAt: string
}
