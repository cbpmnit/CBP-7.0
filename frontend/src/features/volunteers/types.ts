export type {
  VolunteerListItem,
  VolunteerInvitationItem,
  VolunteerDetail,
  VolunteerInviteCheckResult,
  CreateVolunteerPayload,
  GrantAccessPayload,
  UpdateVolunteerPermissionsPayload,
  CreateVolunteerPayload as InviteVolunteerRequest,
  VolunteerInvitationItem as VolunteerInvitationResponse,
  VolunteerListItem as VolunteerListItemResponse,
  VolunteerInviteCheckResult as VerifyInvitationResponse,
} from "./services/volunteerApi"

export interface VolunteerPasswordSetupRequest {
  token: string
  password: string
  confirmPassword?: string
}

export interface AcceptVolunteerInvitationRequest {
  token: string
  password?: string
}

export interface VolunteerProfileDto {
  fullName: string
  email: string
  studentId?: string
  volunteerRole?: string
  department?: string
  phoneNumber?: string
  gender?: string
  profilePhotoUrl?: string
  college?: string
  [key: string]: any
}
