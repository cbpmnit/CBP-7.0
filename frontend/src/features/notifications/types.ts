export type EmailEventType =
  | "ATTENDANCE_QR_GENERATED"
  | "PAYMENT_SUCCESS"
  | "REGISTRATION_SUCCESS"
  | "CERTIFICATE_ISSUED"
  | "SESSION_REMINDER"

export type VariableCategory = "STUDENT" | "PAYMENT" | "ATTENDANCE" | "CERTIFICATE"
export type EmailTemplateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "ACTIVE" | "DISABLED"

export interface EmailVariable {
  key: string
  label: string
  category: VariableCategory
  description: string
  exampleValue: string
  dataType: "TEXT" | "NUMBER" | "DATE" | "IMAGE" | "URL"
}

export interface NotificationTemplateResponse {
  id: string
  name?: string
  templateName: string
  subject: string
  content?: string
  body: string
  notificationType: string
  eventType?: EmailEventType
  designJson?: string
  htmlContent?: string
  variablesUsed?: string[]
  variables?: string[] | string
  status?: EmailTemplateStatus
  publishedAt?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

// Alias
export type EmailTemplateResponse = NotificationTemplateResponse

export interface CreateNotificationTemplateRequest {
  name?: string
  templateName?: string
  subject: string
  content?: string
  body?: string
  notificationType?: string
  eventType?: EmailEventType
  designJson?: string
  htmlContent?: string
  variablesUsed?: string[]
  variables?: string[] | string
  status?: EmailTemplateStatus
}

export type CreateEmailTemplateRequest = CreateNotificationTemplateRequest

export interface UpdateNotificationTemplateRequest {
  name?: string
  templateName?: string
  subject?: string
  content?: string
  body?: string
  notificationType?: string
  eventType?: EmailEventType
  designJson?: string
  htmlContent?: string
  variablesUsed?: string[]
  variables?: string[] | string
  status?: EmailTemplateStatus
}

export type UpdateEmailTemplateRequest = UpdateNotificationTemplateRequest

export interface SendTestEmailRequest {
  templateId: string
  recipientEmail?: string
  recipients?: string[]
  sampleData?: Record<string, string>
  sendToAll?: boolean
}
