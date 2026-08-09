"use client"

import { useState, useEffect, useCallback } from "react"
import { paymentApi } from "../services/paymentApi"
import { PaymentDetailResponse } from "../types"

export function usePayment() {
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchPaymentDetails = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await paymentApi.getMyPayment()
      setPayment(data)
    } catch (err: any) {
      if (err?.status !== 404) {
        setMessage(err?.message || "Failed to load payment details.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentDetails()
  }, [fetchPaymentDetails])

  const handleInitiatePhonePe = async () => {
    setPayLoading(true)
    setMessage(null)
    try {
      const response = await paymentApi.initiatePhonePe()
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl
      } else {
        setMessage("Payment initiated. Transaction ID: " + response.transactionId)
        fetchPaymentDetails()
      }
    } catch (err: any) {
      setMessage(err?.message || "Payment initiation failed. Please try again.")
    } finally {
      setPayLoading(false)
    }
  }

  return {
    loading,
    payLoading,
    payment,
    message,
    handleInitiatePhonePe,
    reload: fetchPaymentDetails,
  }
}
