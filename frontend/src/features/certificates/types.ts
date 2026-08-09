export interface CertificateResponse {
  id: string
  studentId: string
  certificateNumber: string
  certificateType: "PARTICIPATION" | "MERIT" | "VOLUNTEER"
  status: "GENERATED" | "FAILED" | "REVOKED"
  downloadUrl: string
  generatedAt: string
}
