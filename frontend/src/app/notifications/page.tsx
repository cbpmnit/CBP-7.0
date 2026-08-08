"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cbpService } from "@/services/cbpService"
import { paymentService } from "@/services/paymentService"
import { attendanceService } from "@/services/attendanceService"
import { certificateService } from "@/services/certificateService"
import PageTransition from "@/components/animations/PageTransition"
import NotificationPanel from "@/components/dashboard/NotificationPanel"
import { FiBell, FiArrowLeft } from "react-icons/fi"

export default function StudentNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [attendancePct, setAttendancePct] = useState(0)
  const [isCertAvailable, setIsCertAvailable] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cbpRes, payRes, attRes, certRes] = await Promise.allSettled([
        cbpService.getMyRegistration(),
        paymentService.getMyPayment(),
        attendanceService.getMyAttendance(),
        certificateService.getMyCertificate(),
      ])

      if (cbpRes.status === "fulfilled") setIsRegistered(true)
      if (payRes.status === "fulfilled" && payRes.value.paymentStatus === "SUCCESS") setIsPaid(true)
      if (attRes.status === "fulfilled") setAttendancePct(attRes.value.percentage || 0)
      if (certRes.status === "fulfilled") setIsCertAvailable(true)
    } catch (e) {
      console.error("Error loading notification context", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Student Inbox
            </span>
          </div>

          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-amber-600"><FiBell /></span>
              <span>Notification Center</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Real-time notifications, registration alerts, payment updates, and official workshop announcements.
            </p>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse shadow-sm">
              <div className="h-6 w-48 bg-slate-100 rounded mb-4" />
              <div className="h-20 bg-slate-50 rounded" />
            </div>
          ) : (
            <NotificationPanel
              isRegistered={isRegistered}
              isPaid={isPaid}
              attendancePct={attendancePct}
              isCertAvailable={isCertAvailable}
            />
          )}
        </div>
      </main>
    </PageTransition>
  )
}
