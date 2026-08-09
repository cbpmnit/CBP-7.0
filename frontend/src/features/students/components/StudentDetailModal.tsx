"use client"

import React from "react"
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl font-bold">
              <FiUsers />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {studentDetail?.student.name || selectedStudentId}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
                  {studentDetail?.student.studentId || selectedStudentId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {studentDetail?.student.email || "Loading dossier..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>

        {loadingDetail ? (
          <div className="py-16 text-center space-y-3 text-slate-400">
            <FiRefreshCw className="animate-spin text-3xl mx-auto text-cyan-600" />
            <p className="text-xs font-semibold">Loading student record & payment history...</p>
          </div>
        ) : studentDetail ? (
          <div className="space-y-5 text-xs text-slate-700">
            {/* 1. Personal Information */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiUsers className="text-cyan-600" /> Personal Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                  <span className="font-bold text-slate-900">{studentDetail.student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-mono text-slate-800">{studentDetail.student.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-mono text-slate-800">{studentDetail.student.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                  <span className="text-slate-800">{studentDetail.profile.gender || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                  <span className="text-slate-800">{studentDetail.profile.dob || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="text-slate-800">
                    {studentDetail.profile.city ? `${studentDetail.profile.city}, ${studentDetail.profile.state}` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Academic Information */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiBook className="text-cyan-600" /> Academic Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Institute</span>
                  <span className="font-bold text-slate-900">{studentDetail.profile.institute || "MNIT Jaipur"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Course / Branch</span>
                  <span className="text-slate-800">
                    {studentDetail.profile.course} - {studentDetail.profile.branch}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Year / Section</span>
                  <span className="text-slate-800">
                    Year {studentDetail.profile.year} • Section {studentDetail.profile.section || "A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Residence</span>
                  <span className="text-slate-800">
                    {studentDetail.profile.hosteller
                      ? `Hosteller (Room ${studentDetail.profile.roomNumber || "—"})`
                      : "Day Scholar"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Registration & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Registration */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <FiCheckSquare className="text-blue-600" /> Registration Details
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-blue-900">{studentDetail.registration.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration ID:</span>
                    <span className="font-mono text-slate-700">{studentDetail.registration.registrationId || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered On:</span>
                    <span className="text-slate-700">
                      {studentDetail.registration.registeredAt
                        ? new Date(studentDetail.registration.registeredAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <FiDollarSign className="text-emerald-600" /> Fee Payment
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-800">{studentDetail.payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-bold text-slate-900">
                      ₹{studentDetail.payment.amount?.toLocaleString() || "2,500"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono text-[11px] text-slate-700">
                      {studentDetail.payment.transactionId || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Attendance & Certification */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <FiAward className="text-purple-600" /> Attendance &amp; Certificate Eligibility
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Sessions Attended</span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {studentDetail.attendance.attendedSessions} / {studentDetail.attendance.totalSessions}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Attendance Rate</span>
                  <span className="font-extrabold text-sm text-purple-700">
                    {studentDetail.attendance.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Certificate Status</span>
                  <span className="font-bold text-xs text-emerald-700">
                    {studentDetail.certificate.status ||
                      (studentDetail.attendance.percentage >= 75 ? "ELIGIBLE" : "IN PROGRESS")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Could not retrieve student profile details.
          </div>
        )}

        {/* Footer Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrintPdf(selectedStudentId || "")}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition inline-flex items-center gap-1.5 border border-purple-200"
            >
              <FiPrinter /> Download PDF
            </button>
            {studentDetail?.student.email && (
              <a
                href={`mailto:${studentDetail.student.email}?subject=CBP%207.0%20Notification%20-%20MNIT%20Jaipur`}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition inline-flex items-center gap-1.5 border border-blue-200"
              >
                <FiMail /> Send Email
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/students/${selectedStudentId}`)}
              className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold transition inline-flex items-center gap-1.5 border border-cyan-200"
            >
              <FiEdit /> Full Edit Mode
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
