import { api } from "@/utils/api"
import {
  StudentAttendanceSummaryResponse,
  AttendanceQrResponse,
  DailyAttendanceReportResponse,
  AdminAttendanceSummaryResponse,
  AttendanceRecordResponse,
} from "@/types/attendance"

export const attendanceService = {
  // Student
  getMyAttendance: () => api.get<StudentAttendanceSummaryResponse>("/api/v1/student/attendance"),
  getMyQr: () => api.get<AttendanceQrResponse>("/api/v1/student/attendance/qr"),

  // Volunteer / QR Scanning
  markAttendance: (qrToken: string) =>
    api.post<AttendanceRecordResponse>("/api/v1/attendance/mark", { qrToken }),

  // Admin
  getAdminSummary: () => api.get<AdminAttendanceSummaryResponse>("/api/v1/admin/attendance/summary"),
  getAttendanceByDate: (date: string) =>
    api.get<DailyAttendanceReportResponse>(`/api/v1/admin/attendance/date/${date}`),
  getStudentAttendanceByAdmin: (studentId: string) =>
    api.get<StudentAttendanceSummaryResponse>(`/api/v1/admin/attendance/student/${studentId}`),
  generateStudentQr: (studentId: string) =>
    api.post<AttendanceQrResponse>(`/api/v1/admin/attendance/qr/generate/${studentId}`),
  getStudentQrByAdmin: (studentId: string) =>
    api.get<AttendanceQrResponse>(`/api/v1/admin/attendance/qr/${studentId}`),
}
