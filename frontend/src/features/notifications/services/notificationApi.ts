import { apiClient } from "@/lib/apiClient"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
} from "@/features/notifications/types"

export const notificationApi = {
  getAllTemplates: () => apiClient.get<NotificationTemplateResponse[]>("/api/v1/admin/notifications/templates"),
  getTemplateById: (id: string) => apiClient.get<NotificationTemplateResponse>(`/api/v1/admin/notifications/templates/${id}`),
  createTemplate: (data: CreateNotificationTemplateRequest) =>
    apiClient.post<NotificationTemplateResponse>("/api/v1/admin/notifications/templates", data),
  updateTemplate: (id: string, data: UpdateNotificationTemplateRequest) =>
    apiClient.put<NotificationTemplateResponse>(`/api/v1/admin/notifications/templates/${id}`, data),
  deleteTemplate: (id: string) => apiClient.delete<void>(`/api/v1/admin/notifications/templates/${id}`),
}

export default notificationApi
