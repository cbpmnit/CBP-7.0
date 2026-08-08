export interface PaymentDetailResponse {
  id: string
  transactionId: string
  registrationId: string
  studentId: string
  amount: number
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED" | "UNDER_VERIFICATION"
  paymentMode?: string
  createdAt: string
}

export interface PaymentResponse {
  id: string
  transactionId: string
  amount: number
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED" | "UNDER_VERIFICATION"
  createdAt: string
}

export interface PhonePePaymentResponse {
  transactionId: string
  redirectUrl: string
  paymentStatus: string
}

export interface PaymentStatusResponse {
  transactionId: string
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED" | "UNDER_VERIFICATION"
  message?: string
}
