import { api } from "@/utils/api"
import { CbpRegistrationResponse, CbpRegistrationDetailResponse } from "@/types/cbp"

export const cbpService = {
  getMyRegistration: () => api.get<CbpRegistrationDetailResponse>("/api/v1/cbp/me"),
  register: () => api.post<CbpRegistrationResponse>("/api/v1/cbp/register"),
}
