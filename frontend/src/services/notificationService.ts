import { api } from "@/utils/api"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
} from "@/types/notification"

export const notificationService = {
  getAllTemplates: () => api.get<NotificationTemplateResponse[]>("/api/v1/admin/notifications/templates"),
  getTemplateById: (id: string) => api.get<NotificationTemplateResponse>(`/api/v1/admin/notifications/templates/${id}`),
  createTemplate: (data: CreateNotificationTemplateRequest) =>
    api.post<NotificationTemplateResponse>("/api/v1/admin/notifications/templates", data),
  updateTemplate: (id: string, data: UpdateNotificationTemplateRequest) =>
    api.put<NotificationTemplateResponse>(`/api/v1/admin/notifications/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete<void>(`/api/v1/admin/notifications/templates/${id}`),
}
