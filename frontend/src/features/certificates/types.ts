export interface CertificateFieldStyle {
  x: number
  y: number
  fontFamily: string
  fontSize: number
  fontWeight: "normal" | "bold" | "600"
  alignment: "left" | "center" | "right"
  color: string
}

export interface CertificateFieldConfiguration {
  studentName: CertificateFieldStyle
  studentId: CertificateFieldStyle
}

export interface CertificateTemplate {
  id: string
  name: string
  backgroundUrl?: string
  fieldConfigurationJson: string
  status: "DRAFT" | "PUBLISHED"
  createdAt?: string
  updatedAt?: string
}

export interface CertificateResponse {
  id: string
  studentId: string
  templateId?: string
  certificateNumber: string
  certificateType: "PARTICIPATION" | "MERIT" | "VOLUNTEER"
  status: "GENERATED" | "FAILED" | "REVOKED"
  downloadUrl: string
  generatedAt: string
}
