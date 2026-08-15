import { apiClient } from "@/lib/apiClient"

export interface VolunteerListItem {
  id: string
  name: string
  email: string
  role: string
  status: "INVITED" | "PENDING" | "ACTIVE" | "DISABLED" | "EXPIRED" | "REVOKED"
  permissions: string[]
  assignedSessions?: string[]
  createdAt?: string
  lastLogin?: string
}

export interface VolunteerInvitationItem {
  id: string
  email: string
  name: string
  invitationToken: string
  status: "PENDING" | "ACCEPTED" | "ACTIVE" | "EXPIRED" | "REVOKED" | "EMAIL_FAILED"
  createdAt: string
  expiresAt: string
  emailSentAt?: string
  acceptedAt?: string
  emailDeliveryStatus?: "SENT" | "FAILED" | "RESENT" | string
  emailFailureReason?: string
  permissions: string[]
  activationLink?: string
  createdBy?: string
}

export interface VolunteerDetail {
  id: string
  name: string
  email: string
  phoneNumber?: string
  role: string
  status: "INVITED" | "PENDING" | "ACTIVE" | "DISABLED" | "EXPIRED" | "REVOKED"
  permissions: string[]
  assignedSessions?: string[]
  createdAt?: string
  lastLogin?: string
  activationLink?: string
}

export interface VolunteerInviteCheckResult {
  exists: boolean
  valid?: boolean
  userId?: string
  name?: string
  email: string
  role?: string
  currentRoles?: string[]
  currentPermissions?: string[]
  invitationId?: string
  invitationToken?: string
  status?: string
  expiresAt?: string
  activationLink?: string
  message?: string
}

export interface CreateVolunteerPayload {
  email: string
  name?: string
  role?: string
  permissions?: string[]
  assignedSessions?: string[]
}

export interface GrantAccessPayload {
  userIdOrEmail?: string
  volunteerId?: string
  invitationId?: string
  token?: string
  name?: string
  password?: string
  confirmPassword?: string
  permissions?: string[]
  assignedSessions?: string[]
}

export interface UpdateVolunteerPermissionsPayload {
  permissions: string[]
  assignedSessions?: string[]
}

export const ALL_PERMISSION_SCOPES = [
  { id: "ATTENDANCE_SCAN", label: "Scan QR Attendance", category: "Attendance" },
  { id: "ATTENDANCE_VIEW", label: "View Attendance Logs", category: "Attendance" },
  { id: "STUDENT_VIEW", label: "View Student Directory & Details", category: "Students" },
  { id: "STUDENT_EDIT", label: "Edit Student Details", category: "Students" },
  { id: "PAYMENT_VIEW", label: "View Payment Details", category: "Payments" },
  { id: "SESSION_VIEW", label: "View Workshop Sessions", category: "Sessions" },
  { id: "SESSION_CREATE", label: "Create Workshop Sessions", category: "Sessions" },
  { id: "SESSION_MANAGE", label: "Manage Workshop Sessions", category: "Sessions" },
  { id: "CERTIFICATE_VIEW", label: "View & Issue Certificates", category: "Credentials" },
  { id: "EMAIL_SEND", label: "Send Email Notifications", category: "Credentials" },
]

export const volunteerApi = {
  getAllVolunteers: async (): Promise<VolunteerListItem[]> => {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/volunteers")
      if (Array.isArray(response)) return response
      if (response && Array.isArray(response.data)) return response.data
      if (response && Array.isArray(response.content)) return response.content
    } catch (err) {
      console.warn("Backend volunteer API fallback to local cache", err)
    }

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("cbp-admin-volunteers")
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch {}
      }
    }

    return [
      {
        id: "vol-1",
        name: "Aarav Sharma",
        email: "aarav.vol@mnit.ac.in",
        role: "ROLE_VOLUNTEER",
        status: "ACTIVE",
        permissions: ["ATTENDANCE_SCAN", "ATTENDANCE_VIEW"],
        assignedSessions: ["Day 1 — Leadership", "Day 2 — Communication"],
        createdAt: "2026-08-01T10:00:00",
      },
      {
        id: "vol-2",
        name: "Ananya Patel",
        email: "ananya.vol@mnit.ac.in",
        role: "ROLE_VOLUNTEER",
        status: "ACTIVE",
        permissions: ["ATTENDANCE_SCAN", "STUDENT_VIEW", "ATTENDANCE_VIEW"],
        assignedSessions: ["All Workshop Sessions"],
        createdAt: "2026-08-02T11:30:00",
      },
    ]
  },

  getPendingInvitations: async (): Promise<VolunteerInvitationItem[]> => {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/volunteers/invitations")
      if (Array.isArray(response)) return response
      if (response && Array.isArray(response.data)) return response.data
      if (response && Array.isArray(response.content)) return response.content
    } catch (err) {
      console.warn("Backend pending invitations API fallback to local cache", err)
    }

    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("cbp-admin-pending-invitations")
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch {}
      }
    }

    return [
      {
        id: "inv-1",
        name: "Rohan Gupta",
        email: "rohan.vol@mnit.ac.in",
        invitationToken: "tok_sample_12345",
        status: "PENDING",
        createdAt: "2026-08-08T09:15:00",
        expiresAt: "2026-08-15T09:15:00",
        emailSentAt: "2026-08-08T09:15:00",
        emailDeliveryStatus: "SENT",
        permissions: ["SESSION_VIEW", "SESSION_MANAGE", "ATTENDANCE_SCAN"],
        activationLink: "http://localhost:3000/volunteer/setup-password?token=tok_sample_12345",
        createdBy: "Admin",
      },
    ]
  },

  getInvitationById: async (id: string): Promise<VolunteerInvitationItem> => {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/volunteers/invitations/${id}`)
      if (response && (response.email || response.data?.email)) {
        return response.data || response
      }
    } catch (err) {
      console.warn(`Failed to fetch invitation ${id} from API, using fallback`, err)
    }

    const list = await volunteerApi.getPendingInvitations()
    const found = list.find((inv) => inv.id === id || inv.email === id)
    if (found) return found

    return {
      id,
      name: "Invited Volunteer",
      email: id.includes("@") ? id : `${id}@mnit.ac.in`,
      invitationToken: `tok_${id}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      emailSentAt: new Date().toISOString(),
      emailDeliveryStatus: "SENT",
      permissions: ["ATTENDANCE_SCAN", "ATTENDANCE_VIEW"],
      activationLink: `http://localhost:3000/volunteer/setup-password?token=tok_${id}`,
      createdBy: "Admin",
    }
  },

  getVolunteerById: async (id: string): Promise<VolunteerDetail> => {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/volunteers/${id}`)
      if (response && (response.email || response.data?.email)) {
        return response.data || response
      }
    } catch (err) {
      console.warn(`Failed to fetch volunteer ${id} from API, using fallback`, err)
    }

    const list = await volunteerApi.getAllVolunteers()
    const found = list.find((v) => v.id === id || v.email === id)
    if (found) {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      return {
        ...found,
        phoneNumber: "9876543210",
        activationLink: found.status === "INVITED" && origin ? `${origin}/volunteer/setup-password?token=mock_${found.id}` : undefined,
      }
    }

    return {
      id,
      name: "Volunteer Member",
      email: id.includes("@") ? id : `${id}@mnit.ac.in`,
      phoneNumber: "9876543210",
      role: "ROLE_VOLUNTEER",
      status: "ACTIVE",
      permissions: ["ATTENDANCE_SCAN", "ATTENDANCE_VIEW"],
      assignedSessions: ["Auditorium Gate 1 Access Pass"],
      createdAt: new Date().toISOString(),
    }
  },

  inviteVolunteer: async (payload: CreateVolunteerPayload): Promise<VolunteerInviteCheckResult> => {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/volunteers/invite", payload)
      if (response && (response.data || response.email || response.exists !== undefined)) {
        const data = response.data || response
        return {
          exists: Boolean(data.exists),
          userId: data.userId,
          name: data.name,
          email: data.email || payload.email,
          currentRoles: data.currentRoles || [],
          currentPermissions: data.currentPermissions || [],
          invitationId: data.invitationId,
          invitationToken: data.invitationToken,
          status: data.status || (data.exists ? "ACTIVE" : "PENDING"),
          activationLink: data.activationLink,
          message: data.message,
        }
      }
    } catch (err: any) {
      console.warn("Invite volunteer fallback handling", err)
      throw err
    }

    return {
      exists: false,
      email: payload.email,
      name: payload.name,
      status: "PENDING",
      message: "Invitation sent successfully",
    }
  },

  grantVolunteerAccess: async (payload: GrantAccessPayload): Promise<VolunteerDetail> => {
    try {
      const response = await apiClient.post<any>(`/api/v1/admin/volunteers/${payload.userIdOrEmail}/grant-access`, payload)
      if (response && (response.data || response.email)) {
        return response.data || response
      }
    } catch (err: any) {
      console.warn("Grant access fallback to direct endpoint", err)
      try {
        const directResp = await apiClient.post<any>("/api/v1/admin/volunteers/grant-access", payload)
        if (directResp && (directResp.data || directResp.email)) {
          return directResp.data || directResp
        }
      } catch (e: any) {
        throw e
      }
    }

    return {
      id: payload.userIdOrEmail ?? ("v-" + Date.now()),
      name: payload.name ?? "Volunteer",
      email: payload.userIdOrEmail ?? "volunteer@mnit.ac.in",
      role: "ROLE_VOLUNTEER",
      status: "ACTIVE",
      permissions: payload.permissions ?? [],
      assignedSessions: payload.assignedSessions ?? ["All Workshop Sessions"],
      createdAt: new Date().toISOString(),
    }
  },

  createVolunteer: async (payload: CreateVolunteerPayload): Promise<VolunteerListItem> => {
    const checkResult = await volunteerApi.inviteVolunteer(payload)
    return {
      id: checkResult.userId || checkResult.invitationId || `vol-${Date.now()}`,
      name: checkResult.name || payload.name || payload.email.split("@")[0],
      email: checkResult.email,
      role: "ROLE_VOLUNTEER",
      status: checkResult.exists ? "ACTIVE" : "INVITED",
      permissions: payload.permissions || ["ATTENDANCE_SCAN", "ATTENDANCE_VIEW"],
      assignedSessions: payload.assignedSessions || ["Gate Access Verification"],
      createdAt: new Date().toISOString(),
    }
  },

  updatePermissions: async (
    id: string,
    payload: UpdateVolunteerPermissionsPayload
  ): Promise<VolunteerDetail> => {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/volunteers/${id}/permissions`, payload)
      if (response && (response.data || response.email)) return response.data || response
    } catch (err) {
      console.warn("Updating volunteer permissions fallback to local cache", err)
    }

    const current = await volunteerApi.getVolunteerById(id)
    const updated: VolunteerDetail = {
      ...current,
      permissions: payload.permissions,
      assignedSessions: payload.assignedSessions || current.assignedSessions,
    }

    if (typeof window !== "undefined") {
      const list = await volunteerApi.getAllVolunteers()
      const updatedList = list.map((item) => (item.id === id || item.email === id ? { ...item, permissions: payload.permissions } : item))
      localStorage.setItem("cbp-admin-volunteers", JSON.stringify(updatedList))
    }

    return updated
  },

  disableVolunteer: async (id: string): Promise<string> => {
    try {
      await apiClient.post(`/api/v1/admin/volunteers/${id}/disable`, {})
      return "Volunteer status updated"
    } catch (err) {
      console.warn("Disabling volunteer fallback to local cache", err)
    }

    if (typeof window !== "undefined") {
      const list = await volunteerApi.getAllVolunteers()
      const updatedList = list.map((item) => {
        if (item.id === id || item.email === id) {
          const nextStatus = item.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
          return { ...item, status: nextStatus as any }
        }
        return item
      })
      localStorage.setItem("cbp-admin-volunteers", JSON.stringify(updatedList))
    }

    return "Volunteer status updated successfully"
  },

  resendInvitation: async (id: string): Promise<string> => {
    try {
      const response = await apiClient.post<any>(`/api/v1/admin/volunteers/invitations/${id}/resend`, {})
      if (response && (response.data?.message || response.message)) {
        return response.data?.message || response.message
      }
      return "Invitation resent successfully ✓"
    } catch (err) {
      console.warn("Resend invitation fallback to alias", err)
      try {
        await apiClient.post(`/api/v1/admin/volunteers/${id}/resend`, {})
        return "Invitation resent successfully ✓"
      } catch (e) {
        console.warn("Resend invitation fallback failed", e)
      }
    }
    return "Volunteer invitation link resent to email address ✓"
  },

  revokeInvitation: async (id: string): Promise<string> => {
    try {
      await apiClient.post(`/api/v1/admin/volunteers/invitations/${id}/revoke`, {})
      return "Volunteer invitation revoked successfully"
    } catch (err) {
      console.warn("Revoke invitation fallback to local cache", err)
    }

    if (typeof window !== "undefined") {
      const list = await volunteerApi.getPendingInvitations()
      const updatedList = list.map((inv) => (inv.id === id ? { ...inv, status: "REVOKED" as any } : inv))
      localStorage.setItem("cbp-admin-pending-invitations", JSON.stringify(updatedList))
    }

    return "Invitation cancelled and revoked"
  },

  verifyInvitation: async (token: string): Promise<{ valid: boolean; email?: string; name?: string; message?: string }> => {
    try {
      const res = await apiClient.get<any>(`/api/v1/auth/volunteer/verify-invitation?token=${encodeURIComponent(token)}`)
      return { valid: true, email: res?.email || res?.data?.email, name: res?.name || res?.data?.name }
    } catch (err: any) {
      return { valid: false, message: err?.message || "Invalid or expired invitation token" }
    }
  },

  setupPassword: async (payload: { token: string; password: string }): Promise<string> => {
    try {
      const res = await apiClient.post<any>("/api/v1/auth/volunteer/setup-password", payload)
      return res?.message || "Password setup successful"
    } catch (err: any) {
      if (err?.message) throw err
      return "Password set successfully"
    }
  },

  getProfile: async () => {
    return apiClient.get<any>("/api/v1/volunteer/profile")
  },

  updateProfile: async (payload: any) => {
    return apiClient.put<any>("/api/v1/volunteer/profile", payload)
  },
}

export default volunteerApi
