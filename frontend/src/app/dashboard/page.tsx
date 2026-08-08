"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAppSelector } from "@/store/hooks"
import { profileService } from "@/services/profileService"
import { cbpService } from "@/services/cbpService"
import { attendanceService } from "@/services/attendanceService"

import { paymentService } from "@/services/paymentService"
import { certificateService } from "@/services/certificateService"

import { UserProfileResponse } from "@/types/profile"
import { CbpRegistrationDetailResponse } from "@/types/cbp"
import { PaymentDetailResponse } from "@/types/payment"
import { StudentAttendanceSummaryResponse } from "@/types/attendance"
import { CertificateResponse } from "@/types/certificate"

import StudentSummary from "@/components/dashboard/StudentSummary"
import ProgressTimeline from "@/components/dashboard/ProgressTimeline"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import AttendanceModule from "@/components/attendance/AttendanceModule"

import {
  FiUser,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi"

export default function DashboardPage() {
  const { studentId, name } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [showAttendanceModule, setShowAttendanceModule] = useState(false)

  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [cbpReg, setCbpReg] = useState<CbpRegistrationDetailResponse | null>(null)
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null)
  const [attendance, setAttendance] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
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
  }

  const isProfileComplete = Boolean(profile && profile.firstName)
  const isCbpRegistered = Boolean(cbpReg && (cbpReg.registrationStatus === "REGISTERED" || cbpReg.registrationId))
  const isPaymentSuccess = Boolean(cbpReg?.paymentCompleted || (payment && payment.paymentStatus === "SUCCESS"))
  const attendancePct = attendance?.attendancePercentage ?? attendance?.percentage ?? 0
  const isCertificateIssued = Boolean(certificate && (certificate.certificateNumber || certificate.id))

  const quickNavPortals = [
    {
      title: "Student Profile",
      desc: "Personal, academic, and hostel verification details.",
      href: "/profile",
      icon: <FiUser />,
      badge: isProfileComplete ? "Verified ✓" : "Pending",
      badgeColor: isProfileComplete ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200",
      action: null,
    },
    {
      title: "Attendance & QR",
      desc: "Session attendance logs, gate scanner, and admin controls.",
      href: "/attendance",
      icon: <FiCamera />,
      badge: `${attendancePct.toFixed(0)}% Logged`,
      badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
      action: () => setShowAttendanceModule((prev) => !prev),
    },
    {
      title: "Fee Payments",
      desc: "PhonePe transaction history and official fee receipts.",
      href: "/payment",
      icon: <FiCreditCard />,
      badge: isPaymentSuccess ? "Paid ✓" : isCbpRegistered ? "Pending Fee" : "Registration First",
      badgeColor: isPaymentSuccess ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200",
      action: null,
    },
    {
      title: "Certificates",
      desc: "Eligibility checklist and official PDF credential download.",
      href: "/certificate",
      icon: <FiAward />,
      badge: "Module Portal",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
      action: null,
    },
  ]

  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
      {/* Persistent Icon Navigation Rail for Desktop */}
      <SidebarNavigation />

      {/* Centered Main Workspace Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* SECTION 1: Student Identity Overview */}
          <StudentSummary name={name} studentId={studentId} profile={profile} />

          {/* SECTION 2: CBP Program Status Tracker */}
          <ProgressTimeline
            isProfileComplete={isProfileComplete}
            isRegistered={isCbpRegistered}
            isPaymentSuccess={isPaymentSuccess}
            attendancePercentage={attendancePct}
            isCertificateIssued={isCertificateIssued}
          />

          {/* SECTION 3: Quick Navigation Portals */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              CBP Student Portal Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickNavPortals.map((portal) => {
                if (portal.action) {
                  return (
                    <button
                      key={portal.title}
                      type="button"
                      onClick={portal.action}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cbp-card-interactive flex items-start justify-between gap-4 group text-left w-full"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-cyan-700 flex items-center justify-center text-xl shrink-0 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent transition-all">
                          {portal.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{portal.title}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor} shrink-0`}>
                              {portal.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug">{portal.desc}</p>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-cyan-600 transition shrink-0 mt-1">
                        {showAttendanceModule ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    </button>
                  )
                }

                return (
                  <Link
                    key={portal.title}
                    href={portal.href}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cbp-card-interactive flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-cyan-700 flex items-center justify-center text-xl shrink-0 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent transition-all">
                        {portal.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{portal.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor} shrink-0`}>
                            {portal.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{portal.desc}</p>
                      </div>
                    </div>
                    <FiArrowRight className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* SECTION 4: Integrated Attendance Module */}
          {showAttendanceModule && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <AttendanceModule />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
