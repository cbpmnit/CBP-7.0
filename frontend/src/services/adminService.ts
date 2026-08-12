import { dashboardApi } from "@/features/dashboard/services/dashboardApi"
import { studentApi } from "@/features/students/services/studentApi"
import { attendanceApi } from "@/features/attendance/services/attendanceApi"
import { certificateApi } from "@/features/certificates/services/certificateApi"
import { apiClient } from "@/lib/apiClient"

export type { AdminDashboardSummaryDto } from "@/features/dashboard/services/dashboardApi"

export interface CreateSessionPayload {
  dayNumber: number
  title: string
  description?: string
  sessionDate: string
  startTime?: string
  endTime?: string
  venue?: string
}

export interface AdminPaymentOverviewDto {
  totalRegistrations: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  transactions: any[]
}

export const adminService = {
  getDashboardSummary: dashboardApi.getDashboardSummary,
  getStudents: (search?: string, page = 0, size = 50) =>
    studentApi.getStudentsPaginated({ search, page, size }).then((res) => res.content || []),
  getPaymentOverview: () => apiClient.get<AdminPaymentOverviewDto>("/api/v1/admin/payments"),
  getAllSessions: attendanceApi.getAllSessions,
  createSession: (payload: CreateSessionPayload) => apiClient.post<any>("/api/v1/admin/attendance/sessions", payload),
  activateSession: attendanceApi.activateSession,
  closeSession: attendanceApi.closeSession,
  deleteSession: attendanceApi.deleteSession,
  updateSession: attendanceApi.updateSession,
  generateSessionQr: attendanceApi.generateSessionQr,
  getActiveSessionQr: attendanceApi.getActiveSessionQr,
  getSessionSummary: attendanceApi.getSessionSummary,
  getSessionRecords: attendanceApi.getSessionRecords,
  generateAllCertificates: certificateApi.generateAllCertificates,
  generateCertificateForStudent: certificateApi.generateCertificate,
}

export default adminService
