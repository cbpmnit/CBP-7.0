export interface CbpRegistrationResponse {
  id: string
  registrationId: string
  studentId: string
  registrationStatus: "PAYMENT_PENDING" | "REGISTERED" | "CANCELLED"
  paymentCompleted: boolean
  createdAt: string
}

export interface CbpRegistrationDetailResponse {
  id: string
  registrationId: string
  studentId: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phoneNumber: string
  institute: string
  course: string
  branch: string
  year: number
  section?: string
  hosteller: boolean
  roomNumber?: string
  city?: string
  state?: string
  registrationStatus: "PAYMENT_PENDING" | "REGISTERED" | "CANCELLED"
  paymentCompleted: boolean
  createdAt: string
}
