import { api } from "@/utils/api"
import { CertificateResponse } from "@/types/certificate"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"

export const certificateService = {
  // Student
  getMyCertificate: () => api.get<CertificateResponse>("/api/v1/student/certificate"),

  downloadCertificateBlob: async (): Promise<Blob> => {
    const token = localStorage.getItem("cbp-token")
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

  // Admin
  generateCertificate: (studentId: string) =>
    api.post<CertificateResponse>(`/api/v1/admin/certificates/generate/${studentId}`),
  generateAllCertificates: () =>
    api.post<CertificateResponse[]>("/api/v1/admin/certificates/generate-all"),
}
