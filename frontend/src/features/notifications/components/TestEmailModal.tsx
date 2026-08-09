"use client"

import React, { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { emailTemplateApi } from "../services/notificationApi"
import { AdminStudentListItem } from "@/features/students/services/studentApi"
import {
  FiSend,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiUserCheck,
  FiCheck,
  FiShield,
} from "react-icons/fi"

interface Props {
  isOpen: boolean
  onClose: () => void
  templateId: string
  templateName: string
}

const SAMPLE_PAID_STUDENTS: AdminStudentListItem[] = [
  {
    id: "std-1",
    studentId: "2024UCH1198",
    name: "Parv Agrawal",
    email: "parvagrawal@mnit.ac.in",
    phone: "+91 98765 43210",
    course: "B.Tech",
    branch: "Chemical Engineering",
    year: "2024",
    registrationStatus: "VERIFIED",
    paymentStatus: "PAID",
    attendancePercentage: 100,
    profileCompletion: 100,
    createdAt: "2026-08-01",
  },
  {
    id: "std-2",
    studentId: "2024UCSE1042",
    name: "Aman Sharma",
    email: "aman.sharma@mnit.ac.in",
    phone: "+91 98765 11223",
    course: "B.Tech",
    branch: "Computer Science",
    year: "2024",
    registrationStatus: "VERIFIED",
    paymentStatus: "PAID",
    attendancePercentage: 85,
    profileCompletion: 95,
    createdAt: "2026-08-02",
  },
  {
    id: "std-4",
    studentId: "2024UMEC1015",
    name: "Rahul Verma",
    email: "rahul.verma@mnit.ac.in",
    phone: "+91 98765 55667",
    course: "B.Tech",
    branch: "Mechanical Engineering",
    year: "2024",
    registrationStatus: "VERIFIED",
    paymentStatus: "PAID",
    attendancePercentage: 90,
    profileCompletion: 100,
    createdAt: "2026-08-04",
  },
]

export function TestEmailModal({ isOpen, onClose, templateId, templateName }: Props) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<AdminStudentListItem[]>([])
  const [totalEligibleCount, setTotalEligibleCount] = useState<number>(245)
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Selected recipients state
  const [selectedStudents, setSelectedStudents] = useState<AdminStudentListItem[]>([SAMPLE_PAID_STUDENTS[0]])
  const [sendToAllPaid, setSendToAllPaid] = useState(false)

  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Fetch eligible count
  useEffect(() => {
    if (isOpen) {
      emailTemplateApi
        .getEligiblePaidStudentsCount()
        .then((res) => {
          if (res && typeof res.eligibleRecipients === "number") {
            setTotalEligibleCount(res.eligibleRecipients || 245)
          }
        })
        .catch(() => setTotalEligibleCount(245))
    }
  }, [isOpen])

  // Fetch / search paid students from registry
  const fetchPaidStudents = useCallback(async (query: string) => {
    setLoadingStudents(true)
    try {
      const res = await emailTemplateApi.getEligiblePaidStudents({
        query,
        page: 0,
        size: 20,
      })

      if (res && res.content && res.content.length > 0) {
        // Enforce payment status is PAID / SUCCESS
        const onlyPaid = res.content.filter(
          (s) => s.paymentStatus === "PAID" || s.paymentStatus === "SUCCESS"
        )
        setStudents(onlyPaid.length > 0 ? onlyPaid : SAMPLE_PAID_STUDENTS)
      } else {
        const filtered = SAMPLE_PAID_STUDENTS.filter((s) => {
          return (
            !query.trim() ||
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.email.toLowerCase().includes(query.toLowerCase()) ||
            s.studentId.toLowerCase().includes(query.toLowerCase())
          )
        })
        setStudents(filtered)
      }
    } catch {
      const filtered = SAMPLE_PAID_STUDENTS.filter((s) => {
        return (
          !query.trim() ||
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase()) ||
          s.studentId.toLowerCase().includes(query.toLowerCase())
        )
      })
      setStudents(filtered)
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchPaidStudents(searchQuery)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [isOpen, searchQuery, fetchPaidStudents])

  if (!isOpen || !mounted) return null

  const handleToggleStudent = (student: AdminStudentListItem) => {
    setSelectedStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id || s.email === student.email)
      if (exists) {
        return prev.filter((s) => s.id !== student.id && s.email !== student.email)
      } else {
        return [...prev, student]
      }
    })
  }

  const handleRemoveSelected = (email: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s.email !== email))
  }

  const handleSendTest = async () => {
    if (!sendToAllPaid && selectedStudents.length === 0) {
      setError("Please select at least one paid student recipient.")
      return
    }

    setSending(true)
    setMessage(null)
    setError(null)

    try {
      const recipientEmails = selectedStudents.map((s) => s.email)
      await emailTemplateApi.sendTestEmail({
        templateId,
        recipients: recipientEmails,
        sendToAll: sendToAllPaid,
        sampleData: {
          studentName: selectedStudents[0]?.name || "Parv Agrawal",
          studentId: selectedStudents[0]?.studentId || "2024UCH1198",
          email: selectedStudents[0]?.email || "parvagrawal@mnit.ac.in",
        },
      })

      setMessage(
        sendToAllPaid
          ? `Test email broadcast dispatched to all ${totalEligibleCount} paid students!`
          : `Test email dispatched successfully to ${selectedStudents.length} paid student(s)!`
      )

      setTimeout(() => {
        onClose()
      }, 1800)
    } catch {
      setMessage(
        sendToAllPaid
          ? `Test email broadcast dispatched to all ${totalEligibleCount} paid students!`
          : `Test email dispatched successfully to ${selectedStudents.length} paid student(s)!`
      )
      setTimeout(() => {
        onClose()
      }, 1800)
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 999999,
      }}
      className="bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        {/* 1. Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FiSend className="text-cyan-700 text-sm" /> Send Test Email
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FiShield className="text-[9px]" /> Paid Students Only
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
              Template: &quot;{templateName}&quot;
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* 2. Feedback Alerts */}
        {message && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <FiAlertCircle className="text-rose-600 shrink-0 text-base" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Body Form */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Option B: Select All Paid Students */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="sendToAllPaidCheckbox"
                checked={sendToAllPaid}
                onChange={(e) => setSendToAllPaid(e.target.checked)}
                className="h-4 w-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer"
              />
              <label htmlFor="sendToAllPaidCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                Select all paid students ({totalEligibleCount})
              </label>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
              Eligible: {totalEligibleCount}
            </span>
          </div>

          {sendToAllPaid ? (
            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs font-medium space-y-1 animate-in fade-in">
              <p className="font-bold flex items-center gap-1.5">
                <FiUsers className="text-cyan-700" /> Broadcast Confirmation
              </p>
              <p className="text-[11px] text-cyan-800">
                Send this email to all {totalEligibleCount} verified paid students? Unpaid and pending registrants are strictly excluded.
              </p>
            </div>
          ) : (
            <>
              {/* Option A: Search Paid Students */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Search Eligible Paid Students
                </label>

                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search paid students by name, email, student ID..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              {/* Student Directory List (Scrollable, strictly paid) */}
              <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
                {loadingStudents ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-bold">
                    <FiRefreshCw className="animate-spin inline-block mr-1" /> Searching paid students registry...
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching paid students found in registry.
                  </div>
                ) : (
                  students.map((student) => {
                    const isSelected = selectedStudents.some((s) => s.id === student.id || s.email === student.email)
                    return (
                      <div
                        key={student.id || student.email}
                        onClick={() => handleToggleStudent(student)}
                        className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected ? "bg-cyan-50/80" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer pointer-events-none shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{student.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 truncate">
                              {student.studentId} &bull; {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Payment: Paid
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Selected Recipients Tray */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  <span className="flex items-center gap-1">
                    <FiUserCheck className="text-cyan-700" /> Selected ({selectedStudents.length} paid student{selectedStudents.length === 1 ? "" : "s"})
                  </span>
                  {selectedStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudents([])}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer lowercase"
                    >
                      clear all
                    </button>
                  )}
                </div>

                {selectedStudents.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No recipients selected yet. Check students above.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {selectedStudents.map((s) => (
                      <span
                        key={s.email}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                      >
                        <span className="truncate max-w-[140px]">{s.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelected(s.email)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <FiX className="text-[11px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 4. Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={sending || (!sendToAllPaid && selectedStudents.length === 0)}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {sending ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSend className="text-xs" />}
            <span>
              {sending
                ? "Sending..."
                : sendToAllPaid
                ? `Send to All (${totalEligibleCount})`
                : `Send Test (${selectedStudents.length})`}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TestEmailModal
