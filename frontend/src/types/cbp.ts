export interface ProfileSnapshotDto {
  studentId: string
  firstName: string
  middleName?: string | null
  lastName: string
  email: string
  phoneNumber?: string | null
  institute?: string | null
  course: string
  branch: string
  year?: number | null
  section?: string | null
  hosteller?: boolean | null
  roomNumber?: string | null
  city?: string | null
  state?: string | null
}

export interface CbpRegistrationResponse {
  id?: string
  registrationId: string
  registrationStatus: "PAYMENT_PENDING" | "REGISTERED" | "CANCELLED"
  createdAt?: string
  studentId?: string
  firstName?: string
  middleName?: string | null
  lastName?: string
  email?: string
  phoneNumber?: string | null
  institute?: string | null
  course?: string
  branch?: string
  year?: number | null
  section?: string | null
  hosteller?: boolean | null
  roomNumber?: string | null
  city?: string | null
  state?: string | null
  paymentCompleted?: boolean
  profile?: ProfileSnapshotDto
}

export interface CbpRegistrationDetailResponse {
  id?: string
  registrationId: string
  registrationStatus: "PAYMENT_PENDING" | "REGISTERED" | "CANCELLED"
  createdAt?: string
  studentId?: string
  firstName?: string
  middleName?: string | null
  lastName?: string
  email?: string
  phoneNumber?: string | null
  institute?: string | null
  course?: string
  branch?: string
  year?: number | null
  section?: string | null
  hosteller?: boolean | null
  roomNumber?: string | null
  city?: string | null
  state?: string | null
  paymentCompleted?: boolean
  profile?: ProfileSnapshotDto
}
