"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAppSelector } from "@/store/hooks"
import { profileService } from "@/services/profileService"
import { cbpService } from "@/services/cbpService"
import { paymentService } from "@/services/paymentService"
import { attendanceService } from "@/services/attendanceService"
import { certificateService } from "@/services/certificateService"

import { UserProfileResponse } from "@/types/profile"
import { CbpRegistrationDetailResponse } from "@/types/cbp"
import { PaymentDetailResponse } from "@/types/payment"
import { StudentAttendanceSummaryResponse, AttendanceQrResponse } from "@/types/attendance"
import { CertificateResponse } from "@/types/certificate"

import StudentSummary from "@/components/dashboard/StudentSummary"
import ProgressTimeline from "@/components/dashboard/ProgressTimeline"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"

import StatusCard from "@/components/dashboard/StatusCard"
import PaymentCard from "@/components/dashboard/PaymentCard"
import AttendanceCard from "@/components/cards/AttendanceCard"
import AttendanceTable from "@/components/tables/AttendanceTable"
import CertificateCard from "@/components/cards/CertificateCard"
import NotificationPanel from "@/components/dashboard/NotificationPanel"

import StudentQrCard from "@/components/dashboard/StudentQrCard"
import DailyQrCard from "@/components/dashboard/DailyQrCard"
import EmailTemplateManager from "@/components/dashboard/EmailTemplateManager"
import EmailTester from "@/components/dashboard/EmailTester"

import {
  FiUser,
  FiFileText,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiBell,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi"

export default function DashboardPage() {
  const { studentId, name } = useAppSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [cbpReg, setCbpReg] = useState<CbpRegistrationDetailResponse | null>(null)
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null)
  const [attendance, setAttendance] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null)
  const [qrCode, setQrCode] = useState<AttendanceQrResponse | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [profData, cbpData, payData, attData, certData, qrData] = await Promise.allSettled([
        profileService.getProfile(),
        cbpService.getMyRegistration(),
        paymentService.getMyPayment(),
        attendanceService.getMyAttendance(),
        certificateService.getMyCertificate(),
        attendanceService.getMyQr(),
      ])

      if (profData.status === "fulfilled") setProfile(profData.value)
      if (cbpData.status === "fulfilled") setCbpReg(cbpData.value)
      if (payData.status === "fulfilled") setPayment(payData.value)
      if (attData.status === "fulfilled") setAttendance(attData.value)
      if (certData.status === "fulfilled") setCertificate(certData.value)
      if (qrData.status === "fulfilled") setQrCode(qrData.value)
    } catch (e) {
      console.error("Error fetching dashboard data", e)
    } finally {
      setLoading(false)
    }
  }

  const isProfileComplete = !!profile
  const isCbpRegistered = !!cbpReg
  const isPaymentSuccess = payment?.paymentStatus === "SUCCESS"
  const attendancePct = attendance?.percentage ?? 0
  const isCertAvailable = !!certificate

  // Determine Next Action Step for Student Portal Overview
  let nextActionTitle = "Session Attendance QR Active"
  let nextActionDesc = "Present your daily session QR code to volunteers at the workshop hall entry."
  let nextActionBtnText = "Access Attendance QR"
  let nextActionTab = "attendance"
  let nextActionIcon = <FiCamera />

  if (!isPaymentSuccess) {
    nextActionTitle = "Complete CBP Registration Fee Payment"
    nextActionDesc = "Verify your PhonePe online transaction to complete program registration."
    nextActionBtnText = "Go to Payments"
    nextActionTab = "payments"
    nextActionIcon = <FiCreditCard />
  } else if (!isProfileComplete) {
    nextActionTitle = "Complete Student Academic Profile"
    nextActionDesc = "Provide your institute, branch, and hostel details for official certificate issue."
    nextActionBtnText = "Update Profile"
    nextActionTab = "profile"
    nextActionIcon = <FiUser />
  } else if (isCertAvailable) {
    nextActionTitle = "CBP Completion Certificate Unlocked"
    nextActionDesc = "Your official certificate has been issued and is available for PDF download."
    nextActionBtnText = "Download Certificate"
    nextActionTab = "certificates"
    nextActionIcon = <FiAward />
  }

  return (
    <div className="flex-1 w-full bg-cbp-grid text-slate-900 min-h-[calc(100vh-72px)] relative">
      {/* Product-Centric Student Navigation Dock */}
      <SidebarNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace Area */}
      <main
        className={`transition-all duration-300 py-6 px-4 sm:px-6 lg:px-8 ${
          sidebarCollapsed ? "lg:ml-[90px]" : "lg:ml-[240px]"
        }`}
      >
        <div className="mx-auto max-w-6xl">
          {/* 1. Student Identity Summary */}
          <StudentSummary name={name} studentId={studentId} profile={profile} />

          {/* 2. CBP Progress Lifecycle Timeline */}
          <ProgressTimeline
            isProfileComplete={isProfileComplete}
            isRegistered={isCbpRegistered}
            isPaymentSuccess={isPaymentSuccess}
            attendancePercentage={attendancePct}
            isCertificateIssued={isCertAvailable}
          />

          {/* Workspace Content */}
          <div className="space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 3. Today's Important Action Card */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Today's Next Action Step
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cbp-card-interactive flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl shrink-0">
                        {nextActionIcon}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase tracking-wider mb-1">
                          <FiClock /> Immediate Action
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900">{nextActionTitle}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{nextActionDesc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab(nextActionTab)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition shrink-0 self-end sm:self-center"
                    >
                      <span>{nextActionBtnText}</span>
                      <FiArrowRight />
                    </button>
                  </div>
                </div>

                {/* 4. Recent Notifications Stream */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Recent Announcements &amp; Updates
                  </h3>
                  <NotificationPanel
                    isRegistered={isCbpRegistered}
                    isPaid={isPaymentSuccess}
                    attendancePct={attendancePct}
                    isCertAvailable={isCertAvailable}
                  />
                </div>
              </div>
            )}

            {/* DETAILED MODULE TABS */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <StatusCard
                  icon={<FiUser />}
                  title="Student Profile"
                  subtitle="Personal, academic, and hostel details for official verification."
                  statusText={isProfileComplete ? "Complete" : "Action Needed"}
                  statusType={isProfileComplete ? "success" : "warning"}
                  actionText="Open Full Profile Page"
                  actionHref="/profile"
                />
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StudentQrCard qrCode={qrCode} registrationId={cbpReg?.registrationId} loading={loading} />
                  <AttendanceCard summary={attendance} loading={loading} />
                </div>
                <DailyQrCard studentQr={qrCode} />
                <AttendanceTable records={attendance?.records || []} loading={loading} />
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6">
                <PaymentCard payment={payment} loading={loading} />
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-6">
                <CertificateCard certificate={certificate} loading={loading} />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <NotificationPanel
                  isRegistered={isCbpRegistered}
                  isPaid={isPaymentSuccess}
                  attendancePct={attendancePct}
                  isCertAvailable={isCertAvailable}
                />
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-6">
                <EmailTemplateManager />
                <EmailTester />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
