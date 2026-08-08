import { api } from "@/utils/api"
import {
  AttendanceRecordResponse,
  StudentAttendanceSummaryResponse,
  AttendanceSessionDto,
  SessionSummaryResponse,
  StudentSessionRecordDto,
  PageResponse,
  SessionQrCodeResponse,
  BatchQrGenerationResponse,
  QrGenerationStatusResponse,
  StudentSessionQrResponse,
  ScanAttendanceResponse,
  MarkAttendanceRequest,
  AdminAttendanceSummaryResponse,
  DailyAttendanceReportResponse,
} from "@/types/attendance"

export const attendanceService = {
  // Student APIs
  getUpcomingSession: () =>
    api.get<AttendanceSessionDto | null>("/api/v1/attendance/sessions/upcoming"),

  getMyAttendance: () =>
    api.get<StudentAttendanceSummaryResponse>("/api/v1/student/attendance"),

  getStudentSessionQr: (sessionId: string) =>
    api.get<StudentSessionQrResponse>(`/api/v1/student/attendance/sessions/${sessionId}/qr`),

  getMyActiveAttendanceQr: () =>
    api.get<StudentSessionQrResponse>("/api/v1/student/attendance/qr"),

  // Admin Session & Batch Student QR Management APIs
  getAllSessions: () =>
    api.get<AttendanceSessionDto[]>("/api/v1/admin/attendance/sessions"),

  getSessionById: (sessionId: string) =>
    api.get<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}`),

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

  generateStudentQrsForSession: (sessionId: string) =>
    api.post<BatchQrGenerationResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/generate-student-qrs`),

  getQrGenerationStatus: (sessionId: string) =>
    api.get<QrGenerationStatusResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr-status`),

  generateSessionQr: (sessionId: string) =>
    api.post<SessionQrCodeResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  getActiveSessionQr: (sessionId: string) =>
    api.get<SessionQrCodeResponse>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  activateSession: (sessionId: string) =>
    api.post<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}/activate`),

  closeSession: (sessionId: string) =>
    api.post<AttendanceSessionDto>(`/api/v1/admin/attendance/sessions/${sessionId}/close`),

  // Admin Overview & Reporting APIs
  getAdminSummary: () =>
    api.get<AdminAttendanceSummaryResponse>("/api/v1/admin/attendance/summary"),

  getAttendanceByDate: (date: string) =>
    api.get<DailyAttendanceReportResponse>(`/api/v1/admin/attendance/date/${date}`),

  // Volunteer Gate Scanning APIs
  scanAttendanceQr: (qrToken: string) =>
    api.post<ScanAttendanceResponse>("/api/v1/attendance/scan", { qrToken }),

  scanAttendance: (payload: MarkAttendanceRequest) =>
    api.post<AttendanceRecordResponse>("/api/v1/attendance/mark", payload),

  markAttendance: (token: string, studentId?: string) =>
    api.post<AttendanceRecordResponse>("/api/v1/attendance/mark", { qrToken: token, studentId }),
}
