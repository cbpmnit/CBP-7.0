import { apiClient } from "@/lib/apiClient"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  SendTestEmailRequest,
  EmailVariable,
} from "@/features/notifications/types"
import { EMAIL_VARIABLES } from "@/features/notifications/constants/emailVariables"
import { AdminStudentListItem } from "@/features/students/services/studentApi"
import { PageResponse } from "@/types/pagination"

export const emailTemplateApi = {
  getAllTemplates: () => apiClient.get<NotificationTemplateResponse[]>("/api/v1/admin/email-templates"),
  getTemplateById: (id: string) => apiClient.get<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}`),
  createTemplate: (data: CreateNotificationTemplateRequest) =>
    apiClient.post<NotificationTemplateResponse>("/api/v1/admin/email-templates", data),
  updateTemplate: (id: string, data: UpdateNotificationTemplateRequest) =>
    apiClient.put<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}`, data),
  publishTemplate: (id: string) =>
    apiClient.post<NotificationTemplateResponse>(`/api/v1/admin/email-templates/${id}/publish`),
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

// Backward-compatibility alias
export const notificationApi = emailTemplateApi
export default emailTemplateApi
