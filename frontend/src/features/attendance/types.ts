export type AttendanceStatus = "PRESENT" | "ABSENT"
export type SessionStatus = "UPCOMING" | "ACTIVE" | "CLOSED"
export type QrGenerationMode = "MISSING_ONLY" | "SELECTED_STUDENTS" | "FORCE_REGENERATE"

export interface AttendanceRecordResponse {
  id: string
  sessionId: string
  studentId: string
  markedBy?: string
  markedAt?: string
  attendanceDate?: string
  attendanceTime?: string
  status: AttendanceStatus
}

export interface SessionAttendanceStatusDto {
  sessionId: string
  dayNumber: number
  title: string
  sessionDate: string
  status: AttendanceStatus
  markedAt?: string | null
}

export interface StudentAttendanceSummaryResponse {
  studentId: string
  totalSessions: number
  totalClasses?: number
  attendedSessions: number
  present?: number
  attendancePercentage: number
  percentage?: number
  sessions: SessionAttendanceStatusDto[]
  records?: SessionAttendanceStatusDto[] | AttendanceRecordResponse[]
}

export interface AttendanceSessionDto {
  id: string
  dayNumber: number
  title: string
  description?: string | null
  sessionDate: string
  startTime?: string | null
  endTime?: string | null
  venue?: string | null
  status: SessionStatus
  visibility: boolean
  createdBy?: string | null
  createdAt?: string | null
  attendanceCount?: number
}

export interface CreateAttendanceSessionRequest {
  dayNumber: number
  title: string
  description?: string
  sessionDate: string
  startTime?: string
  endTime?: string
  venue?: string
  status?: string
}

export interface SessionSummaryResponse {
  sessionId: string
  dayNumber: number
  sessionTitle: string
  sessionDate: string
  totalRegisteredStudents: number
  presentCount: number
  absentCount: number
  attendancePercentage: number
}

export interface StudentSessionRecordDto {
  studentId: string
  studentName?: string | null
  studentEmail?: string | null
  status: AttendanceStatus
  markedAt?: string | null
  markedBy?: string | null
  hasActiveQr?: boolean
  qrStatus?: "Generated" | "Missing"
  student?: {
    id: string
    name: string
    studentId: string
    email: string
  } | null
  markedByDetail?: {
    id: string
    name: string
    role: string
  } | null
}

export interface EligibleStudentQrItem {
  studentId: string
  name: string
  email: string
  registrationStatus: string
  paymentStatus: string
  qrStatus: "GENERATED" | "MISSING"
  attendanceStatus: "PRESENT" | "ABSENT" | "NOT_MARKED"
}

export interface SessionQrCodeResponse {
  id: string
  sessionId: string
  token: string
  qrImageBase64: string
  generatedAt: string
  expiresAt: string
  active: boolean
}

export interface BatchQrGenerationRequest {
  sessionId: string
  mode?: QrGenerationMode
  studentIds?: string[]
}

export interface BatchQrGenerationResponse {
  totalStudents: number
  generated: number
  generatedCount?: number
  skippedCount?: number
  alreadyAttendedCount?: number
  alreadyHasQrCount?: number
  summaryMessage?: string
}

export interface QrGenerationStatusResponse {
  totalStudents: number
  generatedQr: number
  pendingQr: number
  totalRegisteredStudents?: number
  qrGenerated?: number
  pendingGeneration?: number
}

export interface StudentSessionQrResponse {
  sessionId: string
  dayNumber: number
  title: string
  sessionDate: string
  startTime?: string | null
  endTime?: string | null
  venue?: string | null
  token: string
  qrImageBase64: string
  expiresAt?: string | null
}

export interface ScanAttendanceRequest {
  qrToken: string
}

export interface ScanAttendanceResponse {
  success: boolean
  studentName: string
  studentId: string
  sessionTitle: string
  sessionName?: string
  dayNumber?: number
  markedAt: string
  status?: AttendanceStatus | string
  attendancePercentage?: number
}

export interface MarkAttendanceRequest {
  qrToken?: string
  sessionId?: string
  studentId?: string
}

export interface AdminAttendanceSummaryResponse {
  totalStudents: number
  todayAttendanceCount: number
  totalAttendanceRecords: number
  averageAttendancePercentage: number
}

export interface DailyAttendanceReportResponse {
  date: string
  totalPresent: number
  records: AttendanceRecordResponse[]
}

export interface AttendanceQrResponse {
  id: string
  studentId: string
  token: string
  qrImageBase64: string
  expiresAt: string
}

export interface SessionAttendanceDetailDto {
  dayNumber: number
  title: string
  status: string
  markedBy: string
  markedAt: string
}

export interface StudentAttendanceProfile {
  name: string
  studentId: string
  email: string
  phoneNumber: string
  branch: string
  year: number
  registrationDate: string
  paymentStatus: string
  certificateStatus: string
  totalSessions: number
  presentCount: number
  absentCount: number
  attendancePercentage: number
  attendanceHistory: SessionAttendanceDetailDto[]
}

export interface UserActivityDto {
  description: string
  timestamp: string
}

export interface UserAttendanceProfile {
  name: string
  email: string
  role: string
  permissions: string[]
  recentActivities: UserActivityDto[]
}
