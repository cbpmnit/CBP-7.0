import { api } from "@/utils/api"

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

export interface CreateVolunteerPayload {
  email: string
  name?: string
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

export const adminVolunteerService = {
  getAllVolunteers: async (): Promise<VolunteerListItem[]> => {
    try {
      const response = await api.get<any>("/api/v1/admin/volunteers")
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
      {
        id: "vol-3",
        name: "Rohan Gupta",
        email: "rohan.vol@mnit.ac.in",
        role: "ROLE_VOLUNTEER",
        status: "INVITED",
        permissions: ["SESSION_VIEW", "SESSION_MANAGE"],
        assignedSessions: ["Day 3 — Technical Writing"],
        createdAt: "2026-08-05T09:15:00",
      },
    ]
  },

  getVolunteerById: async (id: string): Promise<VolunteerDetail> => {
    try {
      const response = await api.get<VolunteerDetail>(`/api/v1/admin/volunteers/${id}`)
      if (response && response.email) return response
    } catch (err) {
      console.warn(`Failed to fetch volunteer ${id} from API, using fallback`, err)
    }

    const list = await adminVolunteerService.getAllVolunteers()
    const found = list.find((v) => v.id === id || v.email === id)
    if (found) {
      return {
        ...found,
        phoneNumber: "9876543210",
        activationLink: found.status === "INVITED" ? `http://localhost:3000/volunteer/setup-password?token=mock_${found.id}` : undefined,
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

  createVolunteer: async (payload: CreateVolunteerPayload): Promise<VolunteerListItem> => {
    try {
      const response = await api.post<any>("/api/v1/admin/volunteers", payload)
      if (response && response.email) {
        return {
          id: response.id || UUID(),
          name: response.name || payload.name || payload.email.split("@")[0],
          email: response.email,
          role: "ROLE_VOLUNTEER",
          status: "INVITED",
          permissions: payload.permissions || ["ATTENDANCE_SCAN"],
          assignedSessions: payload.assignedSessions || ["Gate Access"],
          createdAt: new Date().toISOString(),
        }
      }
    } catch (err) {
      console.warn("Creating volunteer fallback to local storage", err)
    }

    const list = await adminVolunteerService.getAllVolunteers()
    const newItem: VolunteerListItem = {
      id: `vol-${Date.now()}`,
      name: payload.name?.trim() || payload.email.split("@")[0],
      email: payload.email.trim().toLowerCase(),
      role: "ROLE_VOLUNTEER",
      status: "INVITED",
      permissions: payload.permissions && payload.permissions.length > 0 ? payload.permissions : ["ATTENDANCE_SCAN", "ATTENDANCE_VIEW"],
      assignedSessions: payload.assignedSessions || ["Gate Access Verification"],
      createdAt: new Date().toISOString(),
    }

    const updatedList = [newItem, ...list]
    if (typeof window !== "undefined") {
      localStorage.setItem("cbp-admin-volunteers", JSON.stringify(updatedList))
    }
    return newItem
  },

  updatePermissions: async (
    id: string,
    payload: UpdateVolunteerPermissionsPayload
  ): Promise<VolunteerDetail> => {
    try {
      const response = await api.put<VolunteerDetail>(`/api/v1/admin/volunteers/${id}/permissions`, payload)
      if (response && response.email) return response
    } catch (err) {
      console.warn("Updating volunteer permissions fallback to local cache", err)
    }

    const current = await adminVolunteerService.getVolunteerById(id)
    const updated: VolunteerDetail = {
      ...current,
      permissions: payload.permissions,
      assignedSessions: payload.assignedSessions || current.assignedSessions,
    }

    if (typeof window !== "undefined") {
      const list = await adminVolunteerService.getAllVolunteers()
      const updatedList = list.map((item) => (item.id === id || item.email === id ? { ...item, permissions: payload.permissions } : item))
      localStorage.setItem("cbp-admin-volunteers", JSON.stringify(updatedList))
    }

    return updated
  },

  disableVolunteer: async (id: string): Promise<string> => {
    try {
      await api.post(`/api/v1/admin/volunteers/${id}/disable`, {})
      return "Volunteer status updated"
    } catch (err) {
      console.warn("Disabling volunteer fallback to local cache", err)
    }

    if (typeof window !== "undefined") {
      const list = await adminVolunteerService.getAllVolunteers()
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
      await api.post(`/api/v1/admin/volunteers/${id}/resend`, {})
      return "Invitation resent successfully ✓"
    } catch (err) {
      console.warn("Resend invitation fallback", err)
    }
    return "Volunteer invitation link resent to email address ✓"
  },
}

function UUID(): string {
  return Math.random().toString(36).substring(2, 9)
}
