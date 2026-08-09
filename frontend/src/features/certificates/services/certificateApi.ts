import { apiClient } from "@/lib/apiClient"
import { CertificateResponse, CertificateTemplate } from "@/features/certificates/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"

export const certificateApi = {
  // Student API
  getMyCertificate: () => apiClient.get<CertificateResponse>("/api/v1/student/certificate"),

  downloadCertificateBlob: async (): Promise<Blob> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null
    const response = await fetch(`${API_BASE_URL}/api/v1/student/certificate/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to download certificate PDF")
    }
    return response.blob()
  },

  // Admin Certificate Template APIs
  getActiveTemplate: () => apiClient.get<CertificateTemplate>("/api/v1/admin/certificate-templates/active"),
  getAllTemplates: () => apiClient.get<CertificateTemplate[]>("/api/v1/admin/certificate-templates"),
  getTemplateById: (id: string) => apiClient.get<CertificateTemplate>(`/api/v1/admin/certificate-templates/${id}`),
  saveTemplate: (data: { name: string; backgroundUrl?: string; fieldConfigurationJson: string; status?: string }) =>
    apiClient.post<CertificateTemplate>("/api/v1/admin/certificate-templates", data),
  updateTemplate: (id: string, data: { name: string; backgroundUrl?: string; fieldConfigurationJson: string; status?: string }) =>
    apiClient.put<CertificateTemplate>(`/api/v1/admin/certificate-templates/${id}`, data),
  publishTemplate: (id: string) =>
    apiClient.post<CertificateTemplate>(`/api/v1/admin/certificate-templates/${id}/publish`),

  // Admin Issuance & Generation APIs
  generateCertificate: (studentId: string) =>
    apiClient.post<CertificateResponse>(`/api/v1/admin/certificates/generate/${studentId}`),
  generateAllCertificates: () =>
    apiClient.post<CertificateResponse[]>("/api/v1/admin/certificates/generate-all"),
}

export default certificateApi
