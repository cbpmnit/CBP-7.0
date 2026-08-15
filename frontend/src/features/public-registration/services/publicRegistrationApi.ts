import { apiClient } from "@/lib/apiClient"
import {
  CreatePublicOrderRequest,
  PublicOrderResponse,
  CompletePublicRegistrationRequest,
  PublicRegistrationStatusResponse,
  PaymentConfigResponse,
} from "../types"

export const publicRegistrationApi = {
  getPaymentConfig: () =>
    apiClient.get<PaymentConfigResponse>("/api/v1/public/registration/payment-config"),

  createOrder: (payload: CreatePublicOrderRequest) =>
    apiClient.post<PublicOrderResponse>("/api/v1/public/registration/create-order", payload),

  initiatePayment: (registrationId: string) =>
    apiClient.post<PublicOrderResponse>("/api/v1/public/registration/payment/create", { registrationId }),

  processCallback: (merchantOrderId: string, status: string, gatewayTransactionId?: string) =>
    apiClient.post<PublicRegistrationStatusResponse>("/api/v1/public/registration/payment/callback", {
      merchantOrderId,
      status,
      gatewayTransactionId,
    }),

  completeRegistration: (payload: CompletePublicRegistrationRequest) =>
    apiClient.post<PublicRegistrationStatusResponse>("/api/v1/public/registration/complete", payload),

  getStatus: (registrationId: string) =>
    apiClient.get<PublicRegistrationStatusResponse>(`/api/v1/public/registration/status/${registrationId}`),
}

export default publicRegistrationApi
