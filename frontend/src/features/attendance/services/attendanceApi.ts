import { apiClient } from "@/lib/apiClient"
import {
  AttendanceRecordResponse,
  StudentAttendanceSummaryResponse,
  AttendanceSessionDto,
  SessionSummaryResponse,
  StudentSessionRecordDto,
  SessionQrCodeResponse,
  BatchQrGenerationResponse,
  QrGenerationStatusResponse,
  StudentSessionQrResponse,
  ScanAttendanceResponse,
  MarkAttendanceRequest,
  AdminAttendanceSummaryResponse,
  DailyAttendanceReportResponse,
  StudentAttendanceProfile,
  UserAttendanceProfile,
} from "@/features/attendance/types"
import { PageResponse } from "@/types/pagination"

export const attendanceApi = {
  // Student APIs
  getUpcomingSession: () =>
    apiClient.get<AttendanceSessionDto | null>("/api/v1/attendance/sessions/upcoming"),

  getMyAttendance: () =>
    apiClient.get<StudentAttendanceSummaryResponse>("/api/v1/student/attendance"),

  getStudentSessionQr: (sessionId: string) =>
    apiClient.get<StudentSessionQrResponse>(`/api/v1/student/attendance/sessions/${sessionId}/qr`),

  getMyActiveAttendanceQr: () =>
    apiClient.get<StudentSessionQrResponse>("/api/v1/student/attendance/qr"),

  getMyActiveAttendanceQrs: () =>
    apiClient.get<StudentSessionQrResponse[]>("/api/v1/student/attendance/active-qrs"),

  // Volunteer & Shared Session APIs
  getVolunteerSessions: () =>
    apiClient.get<AttendanceSessionDto[]>("/api/v1/attendance/sessions"),

  // Admin Session & Batch Student QR Management APIs
  getAllSessions: () =>
    apiClient.get<AttendanceSessionDto[]>("/api/v1/admin/attendance/sessions"),

  getSessionById: (sessionId: string) =>
    apiClient.get<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}`),

  getSessionSummary: (sessionId: string) =>
    apiClient.get<SessionSummaryResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/summary`),

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
    return apiClient.get<PageResponse<StudentSessionRecordDto>>(
      `/api/v1/admin/attendance/sessions/${sessionId}/records?${params.toString()}`
    )
  },

  generateStudentQrsForSession: (sessionId: string) =>
    apiClient.post<BatchQrGenerationResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/generate-student-qrs`),

  getQrGenerationStatus: (sessionId: string) =>
    apiClient.get<QrGenerationStatusResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr-status`),

  generateSessionQr: (sessionId: string) =>
    apiClient.post<SessionQrCodeResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  getActiveSessionQr: (sessionId: string) =>
    apiClient.get<SessionQrCodeResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  activateSession: (sessionId: string) =>
    apiClient.post<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}/activate`),

  closeSession: (sessionId: string) =>
    apiClient.post<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}/close`),

  deleteSession: (sessionId: string) =>
    apiClient.delete<void>(`/api/v1/admin/attendance/sessions/${sessionId}`),

  updateSession: (sessionId: string, payload: any) =>
    apiClient.put<any>(`/api/v1/admin/attendance/sessions/${sessionId}`, payload),

  // Admin Overview & Reporting APIs
  getAdminSummary: () =>
    apiClient.get<AdminAttendanceSummaryResponse>("/api/v1/admin/attendance/summary"),

  getAttendanceByDate: (date: string) =>
    apiClient.get<DailyAttendanceReportResponse>(`/api/v1/admin/attendance/date/${date}`),

  getStudentAttendanceProfile: (studentId: string) =>
    apiClient.get<StudentAttendanceProfile>(`/api/v1/admin/attendance/student/${studentId}/profile`),

  getUserAttendanceProfile: (userId: string) =>
    apiClient.get<UserAttendanceProfile>(`/api/v1/admin/attendance/user/${userId}/profile`),

  // Volunteer Gate Scanning APIs
  scanAttendanceQr: (qrToken: string) =>
    apiClient.post<ScanAttendanceResponse>("/api/v1/attendance/scan", { qrToken }),

  scanAttendance: (payload: MarkAttendanceRequest) =>
    apiClient.post<AttendanceRecordResponse>("/api/v1/attendance/mark", payload),

  markAttendance: (token: string, studentId?: string) =>
    apiClient.post<AttendanceRecordResponse>("/api/v1/attendance/mark", { qrToken: token, studentId }),
}

export default attendanceApi
