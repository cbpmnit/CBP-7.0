import { api } from "@/utils/api"
import { PageResponse } from "@/types/attendance"

export interface AdminStudentListItem {
  id: string
  studentId: string
  name: string
  email: string
  phone: string
  course: string
  branch: string
  year: string
  registrationStatus: string
  paymentStatus: string
  attendancePercentage: number
  profileCompletion: number
  createdAt: string
}

export interface AdminFullStudentDetail {
  student: {
    id: string
    studentId: string
    name: string
    email: string
    phone: string
  }
  profile: {
    firstName: string
    lastName: string
    gender: string
    dob: string
    institute: string
    course: string
    branch: string
    year: string
    section: string
    hosteller: boolean
    roomNumber: string
    city: string
    state: string
  }
  registration: {
    registrationId: string
    status: string
    registeredAt: string
  }
  payment: {
    status: string
    amount: number
    transactionId: string
    paidAt: string
  }
  attendance: {
    totalSessions: number
    attendedSessions: number
    percentage: number
  }
  certificate: {
    status: string
    certificateNumber: string
    issuedAt?: string | null
  }
}

export interface UpdateStudentProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  gender?: string
  dob?: string
  course?: string
  branch?: string
  year?: string
  section?: string
  hosteller?: boolean
  roomNumber?: string
  city?: string
  state?: string
}

export interface AdminDashboardStats {
  totalStudents: number
  registered: number
  paymentCompleted: number
  paymentPending: number
  profileCompleted: number
  averageAttendance: number
  certificateEligible: number
}

export interface ColumnPreferences {
  showEmail: boolean
  showPhone: boolean
  showBranch: boolean
  showPayment: boolean
  showAttendance: boolean
  showRegistration: boolean
}

export const adminStudentService = {
  getStudents: (
    search?: string,
    registrationStatus?: string,
    paymentStatus?: string,
    attendanceStatus?: string,
    profileStatus?: string,
    page = 0,
    size = 20
  ) => {
    const params = new URLSearchParams()
    if (search && search.trim()) params.append("search", search.trim())
    if (registrationStatus && registrationStatus !== "ALL") params.append("registrationStatus", registrationStatus)
    if (paymentStatus && paymentStatus !== "ALL") params.append("paymentStatus", paymentStatus)
    if (attendanceStatus && attendanceStatus !== "ALL") params.append("attendanceStatus", attendanceStatus)
    if (profileStatus && profileStatus !== "ALL") params.append("profileStatus", profileStatus)
    params.append("page", page.toString())
    params.append("size", size.toString())

    return api.get<PageResponse<AdminStudentListItem>>(`/api/v1/admin/students?${params.toString()}`)
  },

  getStudentById: (studentId: string) =>
    api.get<AdminFullStudentDetail>(`/api/v1/admin/students/${studentId}`),

  updateStudentProfile: (studentId: string, payload: UpdateStudentProfilePayload) =>
    api.put<AdminFullStudentDetail>(`/api/v1/admin/students/${studentId}/profile`, payload),

  downloadStudentPdf: async (studentId: string) => {
    const response = await fetch(`/api/v1/admin/students/${studentId}/profile/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
    if (!response.ok) throw new Error("Failed to download PDF dossier")
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Student_Profile_${studentId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  },

  exportStudentsCsv: async (paymentStatus?: string, registrationStatus?: string, search?: string) => {
    const params = new URLSearchParams()
    if (paymentStatus && paymentStatus !== "ALL") params.append("paymentStatus", paymentStatus)
    if (registrationStatus && registrationStatus !== "ALL") params.append("registrationStatus", registrationStatus)
    if (search && search.trim()) params.append("search", search.trim())

    const response = await fetch(`/api/v1/admin/students/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
    if (!response.ok) throw new Error("Failed to export CSV dataset")
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "CBP7_Students_Export.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
  },

  getDashboardStats: () =>
    api.get<AdminDashboardStats>("/api/v1/admin/dashboard/summary-stats"),

  getAdminPreferences: async (): Promise<ColumnPreferences> => {
    try {
      const res = await api.get<{ visibleColumns: string }>("/api/v1/admin/preferences")
      if (res?.visibleColumns) {
        return JSON.parse(res.visibleColumns)
      }
    } catch {}
    return {
      showEmail: true,
      showPhone: true,
      showBranch: true,
      showPayment: true,
      showAttendance: true,
      showRegistration: true,
    }
  },

  saveAdminPreferences: (prefs: ColumnPreferences) =>
    api.post<{ visibleColumns: string }>("/api/v1/admin/preferences", {
      visibleColumns: JSON.stringify(prefs),
    }),
}
