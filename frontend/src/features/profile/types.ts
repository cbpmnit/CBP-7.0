export interface UserProfileResponse {
  id?: string
  name?: string
  studentId?: string
  email?: string
  firstName: string
  middleName?: string | null
  lastName: string
  profilePhotoUrl?: string | null
  gender: string
  dateOfBirth?: string | null
  phoneNumber: string
  sameAsWhatsapp: boolean
  whatsappNumber?: string | null
  institute: string
  course: string
  branch: string
  year: number
  section?: string | null
  hosteller: boolean
  roomNumber?: string | null
  city?: string | null
  state?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UserProfileRequest {
  firstName: string
  middleName?: string | null
  lastName: string
  profilePhotoUrl?: string | null
  gender: string
  dateOfBirth?: string | null
  phoneNumber: string
  sameAsWhatsapp: boolean
  whatsappNumber?: string | null
  institute: string
  course: string
  branch: string
  year: number
  section?: string | null
  hosteller: boolean
  roomNumber?: string | null
  city?: string | null
  state?: string | null
}

export interface ProfileCompletionResponse {
  completed: boolean
  profileStatus: "COMPLETED" | "INCOMPLETE"
  registrationEligible: boolean
  missingRequiredFields?: string[]
  missingMandatoryFields?: string[]
  missingOptionalFields?: string[]
  completionPercentage?: number
  lastCompletedStep?: string
}
