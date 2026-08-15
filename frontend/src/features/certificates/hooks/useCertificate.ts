"use client"

import { useState, useEffect, useCallback } from "react"
import { certificateApi } from "../services/certificateApi"
import { paymentApi } from "@/features/payments/services/paymentApi"
import { attendanceApi } from "@/features/attendance/services/attendanceApi"
import { apiClient } from "@/lib/apiClient"
import { CertificateResponse } from "../types"

export function useCertificate() {
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isRegistered, setIsRegistered] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [attendancePct, setAttendancePct] = useState(0)

  const fetchCertificateAndRequirements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [certRes, cbpRes, payRes, attRes] = await Promise.allSettled([
        certificateApi.getMyCertificate(),
        apiClient.get("/api/v1/cbp/me"),
        paymentApi.getMyPayment(),
        attendanceApi.getMyAttendance(),
      ])

      if (certRes.status === "fulfilled") setCertificate(certRes.value)
      else if (certRes.status === "rejected" && (certRes.reason as any)?.status === 404) {
        setError("Certificate will be generated after completing eligibility requirements.")
      }

      if (cbpRes.status === "fulfilled") setIsRegistered(true)
      if (payRes.status === "fulfilled" && payRes.value.paymentStatus === "SUCCESS") setIsPaid(true)
      if (attRes.status === "fulfilled") setAttendancePct(attRes.value.attendancePercentage || 0)
    } catch {
      setError("Failed to load certificate information.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCertificateAndRequirements()
  }, [fetchCertificateAndRequirements])

  return {
    loading,
    certificate,
    error,
    isRegistered,
    isPaid,
    attendancePct,
    reload: fetchCertificateAndRequirements,
  }
}
