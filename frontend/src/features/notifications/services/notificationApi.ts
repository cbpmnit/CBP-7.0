import { apiClient } from "@/lib/apiClient"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  SendTestEmailRequest,
  EmailVariable,
  NotificationTemplateStats,
} from "@/features/notifications/types"
import { EMAIL_VARIABLES } from "@/features/notifications/constants/emailVariables"
import { AdminStudentListItem } from "@/features/students/services/studentApi"
import { PageResponse } from "@/types/pagination"

export interface EmailBlockItem {
  id: string
  name: string
  category: "STUDENT" | "PAYMENT" | "ATTENDANCE" | "CERTIFICATE" | "CUSTOM"
  content?: string
  htmlSnippet: string
  enabled: boolean
  createdAt?: string
  updatedAt?: string
}

export interface EmailOperationItem {
  id: string
  name: string
  templateId: string
  recipientType: "PAID_STUDENTS" | "ALL_STUDENTS" | "CUSTOM_FILTER" | "INDIVIDUAL"
  filters?: string
  status: "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "COMPLETED_WITH_ERRORS"
  triggerType?: "MANUAL" | "EVENT_TRIGGER" | "SCHEDULED"
  totalRecipients: number
  sentCount: number
  failedCount: number
  scheduledAt?: string
  executedAt?: string
  createdBy?: string
  createdAt?: string
}

export interface EmailLogItem {
  id: string
  operationId?: string
  templateId?: string
  templateName?: string
  recipient: string
  status: "PENDING" | "SENT" | "FAILED" | "SKIPPED_NO_TEMPLATE"
  sentAt: string
  errorMessage?: string
  createdAt?: string
}

export interface CreateEmailOperationPayload {
  name: string
  templateId: string
  recipientType: "PAID_STUDENTS" | "ALL_STUDENTS" | "CUSTOM_FILTER" | "INDIVIDUAL"
  filters?: string
  individualRecipients?: string[]
  triggerType?: "MANUAL" | "EVENT_TRIGGER" | "SCHEDULED"
  scheduledAt?: string
  sampleData?: Record<string, string>
}

export const emailTemplateApi = {
  getAllTemplates: () => apiClient.get<NotificationTemplateResponse[]>("/api/v1/admin/email-templates"),
  getTemplateById: (id: string) => apiClient.get<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}`),
  getTemplateStats: () => apiClient.get<NotificationTemplateStats>("/api/v1/admin/email-templates/stats"),
  getMissingActiveEvents: () => apiClient.get<string[]>("/api/v1/admin/email-templates/missing-active"),
  createTemplate: (data: CreateNotificationTemplateRequest) =>
    apiClient.post<NotificationTemplateResponse>("/api/v1/admin/email-templates", data),
  updateTemplate: (id: string, data: UpdateNotificationTemplateRequest) =>
    apiClient.put<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}`, data),
  publishTemplate: (id: string) =>
    apiClient.post<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}/publish`),
  activateTemplate: (id: string) =>
    apiClient.post<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}/activate`),
  deactivateTemplate: (id: string) =>
    apiClient.post<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}/deactivate`),
  archiveTemplate: (id: string) =>
    apiClient.post<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}/archive`),
  duplicateTemplate: (id: string) =>
    apiClient.post<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}/duplicate`),
  deleteTemplate: (id: string) => apiClient.delete<void>(`/api/v1/admin/email-templates/${id}`),
  sendTestEmail: (data: SendTestEmailRequest) =>
    apiClient.post<{ success: boolean; message: string }>("/api/v1/admin/email-templates/test", data),
  getEligiblePaidStudents: (params: { query?: string; page?: number; size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.query?.trim()) q.append("query", params.query.trim())
    q.append("page", (params.page ?? 0).toString())
    q.append("size", (params.size ?? 20).toString())
    return apiClient.get<PageResponse<AdminStudentListItem>>(`/api/v1/admin/email-templates/eligible-students?${q.toString()}`)
  },
  getEligiblePaidStudentsCount: () =>
    apiClient.get<{ eligibleRecipients: number }>("/api/v1/admin/email-templates/eligible-students/count"),
  getVariablesRegistry: async (): Promise<EmailVariable[]> => {
    try {
      const remoteVars = await apiClient.get<EmailVariable[]>("/api/v1/admin/email-templates/variables")
      return remoteVars || EMAIL_VARIABLES
    } catch {
      return EMAIL_VARIABLES
    }
  },
}

export const emailBlockApi = {
  getAllBlocks: (activeOnly = false) =>
    apiClient.get<EmailBlockItem[]>(`/api/v1/admin/email-blocks${activeOnly ? "?activeOnly=true" : ""}`),
  getBlockById: (id: string) => apiClient.get<EmailBlockItem>(`/api/v1/admin/email-blocks/${id}`),
  createBlock: (data: { name: string; category: string; content?: string; htmlSnippet: string; enabled?: boolean }) =>
    apiClient.post<EmailBlockItem>("/api/v1/admin/email-blocks", data),
  updateBlock: (id: string, data: { name: string; category: string; content?: string; htmlSnippet: string; enabled?: boolean }) =>
    apiClient.put<EmailBlockItem>(`/api/v1/admin/email-blocks/${id}`, data),
  toggleBlock: (id: string) => apiClient.post<EmailBlockItem>(`/api/v1/admin/email-blocks/${id}/toggle`),
  deleteBlock: (id: string) => apiClient.delete<void>(`/api/v1/admin/email-blocks/${id}`),
}

export const emailOperationApi = {
  getAllOperations: () => apiClient.get<EmailOperationItem[]>("/api/v1/admin/email-operations"),
  getOperationById: (id: string) => apiClient.get<EmailOperationItem>(`/api/v1/admin/email-operations/${id}`),
  executeOperation: (data: CreateEmailOperationPayload) =>
    apiClient.post<EmailOperationItem>("/api/v1/admin/email-operations", data),
  getDeliveryLogs: (page = 0, size = 30) =>
    apiClient.get<PageResponse<EmailLogItem>>(`/api/v1/admin/email-operations/logs?page=${page}&size=${size}`),
  getLogsByOperation: (operationId: string) =>
    apiClient.get<EmailLogItem[]>(`/api/v1/admin/email-operations/${operationId}/logs`),
}

export const notificationApi = emailTemplateApi
export default emailTemplateApi
