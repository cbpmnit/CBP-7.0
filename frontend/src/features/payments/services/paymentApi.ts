import { apiClient } from "@/lib/apiClient"
import {
  PaymentDetailResponse,
  PaymentResponse,
  PhonePePaymentResponse,
  PaymentStatusResponse,
} from "@/features/payments/types"

export const paymentApi = {
  getMyPayment: () => apiClient.get<PaymentDetailResponse>("/api/v1/payment/me"),
  initiatePhonePe: () => apiClient.post<PhonePePaymentResponse>("/api/v1/payment/phonepe/initiate"),
  createPayment: (amount: number, registrationId: string) =>
    apiClient.post<PaymentResponse>("/api/v1/payment/create", { amount, registrationId }),
  getPaymentStatus: (transactionId: string) =>
    apiClient.get<PaymentStatusResponse>(`/api/v1/payment/${transactionId}/status`),
}

export default paymentApi
