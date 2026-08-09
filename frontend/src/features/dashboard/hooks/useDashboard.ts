"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppSelector } from "@/store/hooks"
import { profileService } from "@/services/profileService"
import { cbpService } from "@/services/cbpService"
import { paymentService } from "@/services/paymentService"
import { attendanceService } from "@/services/attendanceService"
import { certificateService } from "@/services/certificateService"
import { UserProfileResponse } from "@/types/profile"
import { CbpRegistrationDetailResponse } from "@/types/cbp"
import { PaymentDetailResponse } from "@/types/payment"
import { StudentAttendanceSummaryResponse } from "@/types/attendance"
import { CertificateResponse } from "@/types/certificate"

export function useDashboard() {
  const { studentId, name } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [cbpReg, setCbpReg] = useState<CbpRegistrationDetailResponse | null>(null)
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null)
  const [attendance, setAttendance] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [profData, cbpData, payData, attData, certData] = await Promise.allSettled([
        profileService.getProfile(),
        cbpService.getMyRegistration(),
        paymentService.getMyPayment(),
        attendanceService.getMyAttendance(),
        certificateService.getMyCertificate(),
      ])

      if (profData.status === "fulfilled") setProfile(profData.value)
      if (cbpData.status === "fulfilled") setCbpReg(cbpData.value)
      if (payData.status === "fulfilled") setPayment(payData.value)
      if (attData.status === "fulfilled") setAttendance(attData.value)
      if (certData.status === "fulfilled") setCertificate(certData.value)
    } catch (e) {
      console.error("Error fetching dashboard bootstrap data", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const isProfileComplete = Boolean(profile && profile.firstName)
  const isCbpRegistered = Boolean(cbpReg && (cbpReg.registrationStatus === "REGISTERED" || cbpReg.registrationId))
  const isPaymentSuccess = Boolean(cbpReg?.paymentCompleted || (payment && payment.paymentStatus === "SUCCESS"))
  const attendancePct = attendance?.attendancePercentage ?? attendance?.percentage ?? 0
  const isCertificateIssued = Boolean(certificate && (certificate.certificateNumber || certificate.id))

  return {
    studentId,
    name,
    loading,
    profile,
    cbpReg,
    payment,
    attendance,
    certificate,
    isProfileComplete,
    isCbpRegistered,
    isPaymentSuccess,
    attendancePct,
    isCertificateIssued,
    reload: fetchDashboardData,
  }
}
