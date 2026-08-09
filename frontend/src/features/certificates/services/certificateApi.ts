import { apiClient } from "@/lib/apiClient"
import { CertificateResponse } from "@/features/certificates/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"

export const certificateApi = {
  // Student
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

  // Admin
  generateCertificate: (studentId: string) =>
    apiClient.post<CertificateResponse>(`/api/v1/admin/certificates/generate/${studentId}`),
  generateAllCertificates: () =>
    apiClient.post<CertificateResponse[]>("/api/v1/admin/certificates/generate-all"),
}

export default certificateApi
