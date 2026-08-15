"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppSelector } from "@/store/hooks"
import { profileApi } from "@/features/profile/services/profileApi"
import { paymentApi } from "@/features/payments/services/paymentApi"
import { attendanceApi } from "@/features/attendance/services/attendanceApi"
import { certificateApi } from "@/features/certificates/services/certificateApi"
import { apiClient } from "@/lib/apiClient"
import { UserProfileResponse } from "@/features/profile/types"
import { CbpRegistrationDetailResponse } from "@/types/cbp"
import { PaymentDetailResponse } from "@/features/payments/types"
import { StudentAttendanceSummaryResponse } from "@/features/attendance/types"
import { CertificateResponse } from "@/features/certificates/types"

export function useDashboard() {
  const { studentId, name } = useAppSelector((state) => state.auth)

  const [loading, setLoading] = useState<boolean>(true)
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [cbpReg, setCbpReg] = useState<CbpRegistrationDetailResponse | null>(null)
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null)
  const [attendance, setAttendance] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null)
  const [registrationFee, setRegistrationFee] = useState<number>(100)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [profData, cbpData, payData, attData, certData, configData] = await Promise.allSettled([
        profileApi.getProfile(),
        apiClient.get<CbpRegistrationDetailResponse>("/api/v1/cbp/me"),
        paymentApi.getMyPayment(),
        attendanceApi.getMyAttendance(),
        certificateApi.getMyCertificate(),
        apiClient.get<{ registrationFee: number }>("/api/v1/config/public"),
      ])

      if (profData.status === "fulfilled") setProfile(profData.value)
      if (cbpData.status === "fulfilled") setCbpReg(cbpData.value)
      if (payData.status === "fulfilled") setPayment(payData.value)
      if (attData.status === "fulfilled") setAttendance(attData.value)
      if (certData.status === "fulfilled") setCertificate(certData.value)
      if (configData.status === "fulfilled" && configData.value?.registrationFee) {
        setRegistrationFee(configData.value.registrationFee)
      }
    } catch (e) {
      console.error("Error fetching dashboard bootstrap data", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const isProfileComplete = !!profile
  const isRegistered = !!cbpReg
  const isPaymentSuccess = payment?.paymentStatus === "SUCCESS"
  const attendancePercentage = attendance?.attendancePercentage ?? attendance?.percentage ?? 0
  const isCertificateIssued = !!certificate || (isPaymentSuccess && attendancePercentage >= 75)

  return {
    studentId,
    name,
    loading,
    profile,
    cbpReg,
    payment,
    attendance,
    certificate,
    registrationFee,
    isProfileComplete,
    isRegistered,
    isCbpRegistered: isRegistered,
    isPaymentSuccess,
    attendancePercentage,
    attendancePct: attendancePercentage,
    isCertificateIssued,
    refreshDashboard: fetchDashboardData,
  }
}
