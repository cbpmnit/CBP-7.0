import { api } from "@/utils/api"
import {
  AttendanceSessionDto,
  SessionSummaryResponse,
  StudentSessionRecordDto,
  PageResponse,
  SessionQrCodeResponse,
} from "@/types/attendance"

export interface AdminDashboardSummaryDto {
  totalStudents: number
  registeredStudents: number
  paidStudents: number
  todayAttendance: number
  certificatesIssued: number
}

export interface AdminStudentDetailDto {
  studentId: string
  firstName: string
  lastName: string
  email: string
  branch: string
  course: string
  paymentCompleted: boolean
  attendancePercentage: number
  registrationId: string
}

export interface PaymentTransactionDto {
  studentName: string
  studentId: string
  registrationId: string
  amount: number
  paymentStatus: string
  transactionId: string
  paymentTime: string
}

export interface AdminPaymentOverviewDto {
  totalRegistrations: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  transactions: PaymentTransactionDto[]
}

export interface CreateSessionPayload {
  dayNumber: number
  title: string
  description?: string
  sessionDate: string
  startTime?: string
  endTime?: string
  venue?: string
}

export const adminService = {
  // Summary & Overview
  getDashboardSummary: () =>
    api.get<AdminDashboardSummaryDto>("/api/v1/admin/dashboard/summary"),

  getStudents: (search?: string) => {
    const params = new URLSearchParams()
    if (search && search.trim()) params.append("search", search.trim())
    return api.get<AdminStudentDetailDto[]>(`/api/v1/admin/students?${params.toString()}`)
  },

  getPaymentOverview: () =>
    api.get<AdminPaymentOverviewDto>("/api/v1/admin/payments"),

  // Session Operations
  getAllSessions: () =>
    api.get<AttendanceSessionDto[]>("/api/v1/admin/attendance/sessions"),

  createSession: (payload: CreateSessionPayload) =>
    api.post<AttendanceSessionDto>("/api/v1/admin/attendance/sessions", payload),

  activateSession: (sessionId: string) =>
    api.post<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}/activate`),

  closeSession: (sessionId: string) =>
    api.post<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}/close`),

  generateSessionQr: (sessionId: string) =>
    api.post<SessionQrCodeResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  getActiveSessionQr: (sessionId: string) =>
    api.get<SessionQrCodeResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  getSessionSummary: (sessionId: string) =>
    api.get<SessionSummaryResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/summary`),

  getSessionRecords: (
    sessionId: string,
    search?: string,
    status?: string,
    page = 0,
    size = 20
  ) => {
    const params = new URLSearchParams()
    if (search && search.trim()) params.append("search", search.trim())
    if (status && status !== "ALL") params.append("status", status)
    params.append("page", page.toString())
    params.append("size", size.toString())
    return api.get<PageResponse<StudentSessionRecordDto>>(
      `/api/v1/admin/attendance/sessions/${sessionId}/records?${params.toString()}`
    )
  },

  // Certificates
  generateAllCertificates: () =>
    api.post<any[]>("/api/v1/admin/certificates/generate-all"),

  generateCertificateForStudent: (studentId: string) =>
    api.post<any>(`/api/v1/admin/certificates/generate/${studentId}`),
}
