import { volunteerApi } from "@/features/volunteers/services/volunteerApi"
export type {
  VolunteerListItem,
  VolunteerInvitationItem,
  VolunteerDetail,
  VolunteerInviteCheckResult,
  CreateVolunteerPayload,
  GrantAccessPayload,
  UpdateVolunteerPermissionsPayload,
} from "@/features/volunteers/services/volunteerApi"
export { ALL_PERMISSION_SCOPES } from "@/features/volunteers/services/volunteerApi"

export const adminVolunteerService = volunteerApi
export default adminVolunteerService
