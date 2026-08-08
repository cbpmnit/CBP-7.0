export interface NotificationTemplateResponse {
  id: string
  templateName: string
  subject: string
  body: string
  notificationType: string
  variables?: string[]
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateNotificationTemplateRequest {
  templateName: string
  subject: string
  body: string
  notificationType: string
  variables?: string[]
}

export interface UpdateNotificationTemplateRequest {
  templateName?: string
  subject?: string
  body?: string
  notificationType?: string
  variables?: string[]
}
