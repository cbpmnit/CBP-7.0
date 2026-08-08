export interface UserProfileResponse {
  id: string
  studentId: string
  firstName: string
  middleName?: string
  lastName: string
  profilePhotoUrl?: string
  gender: string
  dateOfBirth: string
  phoneNumber: string
  sameAsWhatsapp: boolean
  whatsappNumber?: string
  institute: string
  course: string
  branch: string
  year: number
  section?: string
  hosteller: boolean
  roomNumber?: string
  city?: string
  state?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserProfileRequest {
  firstName: string
  middleName?: string
  lastName: string
  profilePhotoUrl?: string
  gender: string
  dateOfBirth: string
  phoneNumber: string
  whatsappNumber?: string
  institute: string
  course: string
  branch: string
  year: number
  section?: string
  hosteller: boolean
  roomNumber?: string
  city?: string
  state?: string
}
