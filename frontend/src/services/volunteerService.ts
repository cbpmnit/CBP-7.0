import { api } from "@/utils/api"

export interface InviteVolunteerRequest {
  email: string
  name?: string
  permissions?: string[]
}

export interface VolunteerInvitationResponse {
  id: string
  email: string
  name: string
  invitationToken: string
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  expiresAt: string
  activationLink: string
  permissions?: string[]
}

export interface VolunteerListItemResponse {
  id: string
  name: string
  email: string
  role: string
  status: "INVITED" | "ACTIVE" | "DISABLED" | "EXPIRED" | "PENDING"
  permissions?: string[]
  createdAt: string
}

export interface VerifyInvitationResponse {
  email: string
  name: string
  valid: boolean
  message: string
}

export interface VolunteerPasswordSetupRequest {
  token: string
  password: string
  confirmPassword?: string
}

export interface AcceptVolunteerInvitationRequest {
  token: string
  password?: string
}

export const volunteerService = {
  // Admin Endpoints
  async getAllVolunteers(): Promise<VolunteerListItemResponse[]> {
    const res = await api.get<any>("/api/v1/admin/volunteers")
    return res?.data || res || []
  },

  async inviteVolunteer(data: InviteVolunteerRequest): Promise<VolunteerInvitationResponse> {
    const res = await api.post<any>("/api/v1/admin/volunteers/invite", data)
    return res?.data || res
  },

  async resendInvitation(invitationId: string): Promise<VolunteerInvitationResponse> {
    const res = await api.post<any>(`/api/v1/admin/volunteers/${invitationId}/resend`, {})
    return res?.data || res
  },

  async disableVolunteer(idOrEmail: string): Promise<string> {
    const res = await api.post<any>(`/api/v1/admin/volunteers/${idOrEmail}/disable`, {})
    return res?.message || "Volunteer disabled"
  },

  // Public Volunteer Activation Endpoints
  async verifyInvitation(token: string): Promise<VerifyInvitationResponse> {
    const res = await api.get<any>(`/api/v1/auth/volunteer/verify-invitation?token=${encodeURIComponent(token)}`)
    return res?.data || res
  },

  async acceptInvitation(data: AcceptVolunteerInvitationRequest): Promise<any> {
    const res = await api.post<any>("/api/v1/auth/volunteer/accept-invitation", data)
    return res?.data || res
  },

  async setupPassword(data: VolunteerPasswordSetupRequest): Promise<string> {
    const res = await api.post<any>("/api/v1/auth/volunteer/setup-password", data)
    return res?.message || res?.data || "Account activated successfully"
  },
}
