export interface AttendanceRecordResponse {
  id: string
  studentId: string
  qrCodeId: string
  markedBy: string
  attendanceDate: string
  attendanceTime: string
  status: "PRESENT" | "ABSENT"
}

export interface StudentAttendanceSummaryResponse {
  studentId: string
  totalClasses: number
  present: number
  percentage: number
  records: AttendanceRecordResponse[]
}

export interface DailyAttendanceReportResponse {
  date: string
  totalPresent: number
  records: AttendanceRecordResponse[]
}

export interface AdminAttendanceSummaryResponse {
  totalStudents: number
  totalAttendanceRecords: number
  averageAttendancePercentage: number
  todayAttendanceCount: number
}

export interface AttendanceQrResponse {
  id: string
  studentId: string
  token: string
  qrImageBase64: string
  expiresAt: string
}
