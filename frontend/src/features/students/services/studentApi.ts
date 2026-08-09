import { apiClient } from "@/lib/apiClient"
import { PageResponse } from "@/types/pagination"

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
    certificateId: string
    issuedAt: string
  }
}

export interface StudentFilterParams {
  search?: string
  registrationStatus?: string
  paymentStatus?: string
  attendanceStatus?: string
  profileStatus?: string
  page?: number
  size?: number
}

export interface AdminDashboardStats {
  totalStudents: number
  registeredStudents: number
  paidStudents: number
  paymentCompleted?: number
  paymentPending?: number
  certificateEligible?: number
}

export const studentApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats | null> => {
    try {
      return await apiClient.get<AdminDashboardStats>("/api/v1/admin/dashboard/summary")
    } catch {
      return null
    }
  },

  getStudents: (params: StudentFilterParams = {}) => {
    const query = new URLSearchParams()
    if (params.search?.trim()) query.append("search", params.search.trim())
    if (params.registrationStatus && params.registrationStatus !== "ALL") query.append("registrationStatus", params.registrationStatus)
    if (params.paymentStatus && params.paymentStatus !== "ALL") query.append("paymentStatus", params.paymentStatus)
    if (params.attendanceStatus && params.attendanceStatus !== "ALL") query.append("attendanceStatus", params.attendanceStatus)
    if (params.profileStatus && params.profileStatus !== "ALL") query.append("profileStatus", params.profileStatus)
    query.append("page", (params.page ?? 0).toString())
    query.append("size", (params.size ?? 20).toString())

    return apiClient.get<PageResponse<AdminStudentListItem>>(`/api/v1/admin/students?${query.toString()}`)
  },

  getStudentsPaginated: (params: StudentFilterParams = {}) => {
    return studentApi.getStudents(params)
  },

  getStudentDetail: (studentId: string) => {
    return apiClient.get<AdminFullStudentDetail>(`/api/v1/admin/students/${studentId}`)
  },

  getStudentById: (studentId: string) => {
    return apiClient.get<AdminFullStudentDetail>(`/api/v1/admin/students/${studentId}`)
  },

  updateStudentProfile: (studentId: string, payload: any) => {
    return apiClient.put<AdminFullStudentDetail>(`/api/v1/admin/students/${studentId}`, payload)
  },

  downloadStudentPdf: async (studentId: string): Promise<Blob> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"
    const token = typeof window !== "undefined" ? (localStorage.getItem("cbp-token") || "") : ""
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/students/${studentId}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to download student dossier PDF")
    }
    return response.blob()
  },

  exportStudentsCsv: async (params: StudentFilterParams = {}): Promise<Blob> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"
    const token = typeof window !== "undefined" ? (localStorage.getItem("cbp-token") || "") : ""
    const query = new URLSearchParams()
    if (params.search?.trim()) query.append("search", params.search.trim())
    if (params.registrationStatus && params.registrationStatus !== "ALL") query.append("registrationStatus", params.registrationStatus)
    if (params.paymentStatus && params.paymentStatus !== "ALL") query.append("paymentStatus", params.paymentStatus)
    if (params.attendanceStatus && params.attendanceStatus !== "ALL") query.append("attendanceStatus", params.attendanceStatus)
    if (params.profileStatus && params.profileStatus !== "ALL") query.append("profileStatus", params.profileStatus)

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/students/export/csv?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to export student CSV")
    }
    return response.blob()
  },
}

export default studentApi
