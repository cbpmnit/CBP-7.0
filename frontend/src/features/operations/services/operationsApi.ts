import { apiClient } from "@/lib/apiClient"

export interface AdminOperationsOverviewDto {
  // Readiness checks
  registrationOpen: boolean
  paymentGatewayActive: boolean
  sessionsConfigured: boolean
  attendanceSystemReady: boolean
  certificateTemplatePublished: boolean
  emailTemplatesReady: boolean

  // Core Counts
  registeredCount: number
  paidCount: number
  pendingPaymentCount: number
  failedPaymentCount: number
  sessionsConfiguredCount: number

  // Active Attendance
  attendancePresentCount: number
  attendanceAbsentCount: number
  attendancePercentage: number

  // Certificate stats
  certificatesEligibleCount: number
  certificatesGeneratedCount: number
  certificatesPublishedCount: number

  // Current Session Details
  currentSessionId: string | null
  currentSessionTitle: string | null
  currentSessionDay: number | null
  currentSessionTime: string | null
  currentSessionStatus: string | null

  // Upcoming Session Details
  upcomingSessionTitle: string | null
  upcomingSessionDay: number | null
  upcomingSessionTime: string | null
}

export const operationsApi = {
  getOverview: () =>
    apiClient.get<AdminOperationsOverviewDto>("/api/v1/admin/operations/overview"),

  getAllSessions: () =>
    apiClient.get<any[]>("/api/v1/admin/attendance/sessions"),

  generateAllCertificates: () =>
    apiClient.post<any[]>("/api/v1/admin/operations/certificates/generate-all"),

  publishAllCertificates: () =>
    apiClient.post<any[]>("/api/v1/admin/operations/certificates/publish-all"),

  // Sessions Operations
  activateSession: (sessionId: string) =>
    apiClient.post<any>(`/api/v1/admin/attendance/sessions/${sessionId}/activate`),

  closeSession: (sessionId: string) =>
    apiClient.post<any>(`/api/v1/admin/attendance/sessions/${sessionId}/close`),

  generateSessionQr: (sessionId: string) =>
    apiClient.post<any>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  deactivateSessionQr: (sessionId: string) =>
    apiClient.delete<any>(`/api/v1/admin/attendance/sessions/${sessionId}/qr`),

  getEmailTemplates: () =>
    apiClient.get<any[]>("/api/v1/admin/email-templates"),

  executeEmailCampaign: (data: {
    name: string
    templateId: string
    recipientType: string
    triggerType: string
  }) =>
    apiClient.post<any>("/api/v1/admin/email-operations", data),
}

export default operationsApi
