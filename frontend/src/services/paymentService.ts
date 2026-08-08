import { api } from "@/utils/api"
import {
  PaymentDetailResponse,
  PaymentResponse,
  PhonePePaymentResponse,
  PaymentStatusResponse,
} from "@/types/payment"

export const paymentService = {
  getMyPayment: () => api.get<PaymentDetailResponse>("/api/v1/payment/me"),
  initiatePhonePe: () => api.post<PhonePePaymentResponse>("/api/v1/payment/phonepe/initiate"),
  createPayment: (amount: number, registrationId: string) =>
    api.post<PaymentResponse>("/api/v1/payment/create", { amount, registrationId }),
  getPaymentStatus: (transactionId: string) =>
    api.get<PaymentStatusResponse>(`/api/v1/payment/${transactionId}/status`),
}
