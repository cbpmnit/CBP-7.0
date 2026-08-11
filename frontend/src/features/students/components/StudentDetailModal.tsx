"use client"

import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { AdminFullStudentDetail } from "../types"
import {
  FiUsers,
  FiX,
  FiRefreshCw,
  FiBook,
  FiCheckSquare,
  FiDollarSign,
  FiAward,
  FiPrinter,
  FiMail,
  FiEdit,
} from "react-icons/fi"

interface StudentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  studentDetail: AdminFullStudentDetail | null
  selectedStudentId: string | null
  loadingDetail: boolean
  handlePrintPdf: (studentId: string) => void
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  studentDetail,
  selectedStudentId,
  loadingDetail,
  handlePrintPdf,
}: StudentDetailModalProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // 1. Set mounted state for Portal rendering
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const onDownloadPdf = async () => {
    if (!selectedStudentId) return
    setDownloadingPdf(true)
    try {
      await handlePrintPdf(selectedStudentId)
    } catch (err) {
      console.error("PDF generation/download handler error", err)
    } finally {
      setDownloadingPdf(false)
    }
  }

  // 2. Lock background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // 3. Reset scroll to top when opening or switching students
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [isOpen, studentDetail])

  // 4. Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const firstInitial = studentDetail?.student.name
    ? studentDetail.student.name.charAt(0).toUpperCase()
    : "S"

  // Render the modal inside a Portal directly in document.body
  return createPortal(
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 bg-white md:bg-black/45 transition-opacity duration-200 animate-in fade-in"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Container:
          - Mobile: 100vw, 100dvh, flat corners.
          - Tablet (md): Centered dialog, max-w-2xl, max-h-[85vh].
          - Desktop (lg): Centered dialog, max-w-4xl (896px wide), max-h-[90vh], height calc(100vh - 80px).
      */}
      <div className="bg-white border-0 md:border md:border-slate-200 shadow-none md:shadow-2xl flex flex-col w-full h-[100dvh] max-h-[100dvh] md:h-auto md:max-h-[85vh] lg:h-[calc(100vh-80px)] lg:max-h-[90vh] md:max-w-2xl lg:max-w-4xl rounded-none md:rounded-3xl overflow-hidden md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:inset-auto transition-all duration-200 scale-100 animate-in zoom-in-95 duration-150">
        
        {/* Pinned/Fixed Header Section: Height exactly 64px on mobile and 70px on tablet/desktop */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-100 shrink-0 bg-white z-10 h-[64px] md:h-[70px]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Profile Icon */}
            <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-base md:text-lg font-black shrink-0 shadow-3xs">
              {loadingDetail ? (
                <FiRefreshCw className="animate-spin text-sm" />
              ) : (
                firstInitial
              )}
            </div>
            
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                <h2 className="text-xs md:text-sm lg:text-base font-black text-slate-900 leading-tight truncate">
                  {studentDetail?.student.name || selectedStudentId}
                </h2>
                {studentDetail?.registration.status && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase border shrink-0 ${
                    studentDetail.registration.status === "REGISTERED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {studentDetail.registration.status}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-500 font-mono text-[9px] md:text-[10px]">
                <span className="truncate">Reg ID: <strong className="text-slate-800 font-extrabold">{studentDetail?.registration.registrationId || "—"}</strong></span>
                <span className="hidden md:inline text-slate-300">&bull;</span>
                <span className="truncate">Student ID: <strong className="text-slate-800 font-extrabold">{studentDetail?.student.studentId || selectedStudentId}</strong></span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            aria-label="Close profile details"
            className="h-8 px-3 rounded-lg bg-[#111827] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 shadow-sm"
          >
            <FiX className="text-base" />
            <span className="hidden md:inline">Close</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-5 space-y-6 overflow-x-hidden bg-slate-50/30"
        >
          {loadingDetail ? (
            <div className="py-24 text-center space-y-3 text-slate-400">
              <FiRefreshCw className="animate-spin text-3xl mx-auto text-cyan-600" />
              <p className="text-xs font-semibold">Loading student record & payment history...</p>
            </div>
          ) : studentDetail ? (
            <div className="space-y-6 text-xs text-slate-700">
              
              {/* 1. Profile Summary */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <FiUsers className="text-cyan-600" /> Profile Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-3xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Full Name</span>
                    <span className="font-extrabold text-slate-900 text-xs break-words">{studentDetail.student.name}</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Email Address</span>
                    <span className="font-mono text-slate-800 text-xs break-all select-all block leading-tight">{studentDetail.student.email}</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Phone Number</span>
                    <span className="font-mono text-slate-800 text-xs">{studentDetail.student.phone || "—"}</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Gender &amp; Date of Birth</span>
                    <span className="text-slate-800 text-xs">
                      {studentDetail.profile.gender || "—"} {studentDetail.profile.dob ? `• ${studentDetail.profile.dob}` : ""}
                    </span>
                  </div>
                  <div className="space-y-0.5 md:col-span-2 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Location / Address</span>
                    <span className="text-slate-800 text-xs leading-normal">
                      {studentDetail.profile.city ? `${studentDetail.profile.city}, ${studentDetail.profile.state}` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Academic Details */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <FiBook className="text-cyan-600" /> Academic Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-3xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Institute</span>
                    <span className="font-extrabold text-slate-900 text-xs break-words leading-tight block">{studentDetail.profile.institute || "MNIT Jaipur"}</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Course</span>
                    <span className="text-slate-800 text-xs">{studentDetail.profile.course || "—"}</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Branch</span>
                    <span className="text-slate-805 text-xs break-words leading-tight block">{studentDetail.profile.branch || "—"}</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Year / Section</span>
                    <span className="text-slate-800 text-xs">
                      Year {studentDetail.profile.year || "—"} • Section {studentDetail.profile.section || "A"}
                    </span>
                  </div>
                  <div className="space-y-0.5 md:col-span-2 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Residence Status</span>
                    <span className="text-slate-800 text-xs">
                      {studentDetail.profile.hosteller
                        ? `Hosteller (Room ${studentDetail.profile.roomNumber || "—"})`
                        : "Day Scholar"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Fee Payment Details */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <FiDollarSign className="text-cyan-600" /> Fee Payment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-3xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Payment Status</span>
                    <div>
                      {(() => {
                        const payStatus = (studentDetail.payment.status || "PENDING").toUpperCase()
                        let badgeStyle = "bg-amber-100 text-amber-900 border-amber-200"
                        if (payStatus === "SUCCESS") {
                          badgeStyle = "bg-emerald-100 text-emerald-900 border-emerald-200"
                        } else if (payStatus === "FAILED") {
                          badgeStyle = "bg-rose-100 text-rose-900 border-rose-200"
                        }
                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                            {payStatus}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Amount</span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      ₹{studentDetail.payment.amount?.toLocaleString() || "2,500"}
                    </span>
                  </div>
                  <div className="space-y-0.5 md:col-span-2 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Transaction ID</span>
                    <span className="font-mono text-slate-800 text-[11px] break-all select-all font-semibold block leading-tight">
                      {studentDetail.payment.transactionId || "—"}
                    </span>
                  </div>
                  <div className="space-y-0.5 md:col-span-2 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Payment Date</span>
                    <span className="text-slate-850 text-xs">
                      {studentDetail.payment.paidAt
                        ? new Date(studentDetail.payment.paidAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Attendance Details */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <FiCheckSquare className="text-cyan-600" /> Attendance Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-3xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Sessions Attended</span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      {studentDetail.attendance.attendedSessions} / {studentDetail.attendance.totalSessions} sessions
                    </span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Attendance Rate</span>
                    <span className={`font-extrabold text-xs ${
                      studentDetail.attendance.percentage >= 75 ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      {studentDetail.attendance.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Certificate Eligibility */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <FiAward className="text-cyan-600" /> Certificate Eligibility
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-3xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Eligibility Status</span>
                    <span className={`font-extrabold text-xs ${
                      studentDetail.attendance.percentage >= 75 ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      {studentDetail.attendance.percentage >= 75 ? "ELIGIBLE" : "NOT ELIGIBLE"}
                    </span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Certificate Status</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {studentDetail.certificate.status ||
                        (studentDetail.attendance.percentage >= 75 ? "ELIGIBLE" : "IN PROGRESS")}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs italic">
              Could not retrieve student profile details.
            </div>
          )}
        </div>

        {/* Pinned/Fixed Footer Action Buttons: Height exactly 70px (h-[70px]) on Desktop/Tablet */}
        <div className="p-4 md:px-6 md:py-4 border-t border-slate-100 shrink-0 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 h-auto md:h-[70px]">
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto animate-in slide-in-from-bottom-5 duration-200">
            <button
              onClick={onDownloadPdf}
              disabled={loadingDetail || !studentDetail || downloadingPdf}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] md:text-xs font-bold transition inline-flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPdf ? (
                <FiRefreshCw className="animate-spin text-slate-400 text-xs md:text-sm" />
              ) : (
                <FiPrinter className="text-slate-400 text-xs md:text-sm" />
              )}
              <span>{downloadingPdf ? "Generating PDF..." : "Download PDF"}</span>
            </button>
            
            {studentDetail?.student.email && (
              <a
                href={`mailto:${studentDetail.student.email}?subject=CBP%207.0%20Notification%20-%20MNIT%20Jaipur`}
                className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] md:text-xs font-bold transition inline-flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer shadow-3xs"
              >
                <FiMail className="text-slate-400 text-xs md:text-sm" />
                <span>Send Email</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto animate-in slide-in-from-bottom-5 duration-200">
            <button
              onClick={() => router.push(`/admin/students/${selectedStudentId}`)}
              disabled={!selectedStudentId}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] md:text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <FiEdit className="text-xs md:text-sm" />
              <span>Full Edit Mode</span>
            </button>
            <button
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] md:text-xs font-bold transition cursor-pointer shadow-3xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  )
}
