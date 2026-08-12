export type EmailEventType =
  | "REGISTRATION_SUCCESS"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "ATTENDANCE_QR_GENERATED"
  | "CERTIFICATE_ISSUED"
  | "CERTIFICATE_READY"
  | "VOLUNTEER_INVITATION"
  | "VOLUNTEER_ASSIGNED"
  | "VOLUNTEER_PERMISSIONS_UPDATED"
  | "VOLUNTEER_ACCESS_REVOKED"
  | "SESSION_REMINDER"
  | "GENERAL_NOTIFICATION"

export type VariableCategory = "STUDENT" | "PAYMENT" | "ATTENDANCE" | "CERTIFICATE" | "VOLUNTEER" | "REGISTRATION"
export type EmailTemplateStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "INACTIVE" | "ARCHIVED"

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
  publishedAt?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

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

export interface NotificationTemplateStats {
  totalTemplates: number
  activeTemplates: number
  draftTemplates: number
  publishedTemplates: number
  archivedTemplates: number
  failedDeliveriesCount: number
  missingActiveEventTypes: string[]
}
