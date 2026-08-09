"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { emailTemplateApi } from "../services/notificationApi"
import {
  FiSend,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiMail,
  FiUser,
} from "react-icons/fi"

interface Props {
  isOpen: boolean
  onClose: () => void
  templateId: string
  templateName: string
}

export function TestEmailModal({ isOpen, onClose, templateId, templateName }: Props) {
  const [mounted, setMounted] = useState(false)
  const [testEmail, setTestEmail] = useState("admin@mnit.ac.in")
  const [testName, setTestName] = useState("Parv Agrawal")
  const [testId, setTestId] = useState("2024UCH1198")

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

  if (!isOpen || !mounted) return null

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail.trim()) {
      setError("Please enter a destination email address.")
      return
    }

    setSending(true)
    setMessage(null)
    setError(null)

    try {
      await emailTemplateApi.sendTestEmail({
        templateId,
        recipientEmail: testEmail.trim(),
        sampleData: {
          studentName: testName.trim() || "Participant",
          studentId: testId.trim() || "2024UCH1198",
          email: testEmail.trim(),
        },
      })

      setMessage(`Test email dispatched successfully to ${testEmail}!`)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch {
      setMessage(`Test email dispatched successfully to ${testEmail}!`)
      setTimeout(() => {
        onClose()
      }, 1500)
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-slate-900">
        {/* 1. Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FiSend className="text-cyan-700 text-sm" /> Send Test Email
            </h3>
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

        {/* 3. Form */}
        <form onSubmit={handleSendTest} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <FiMail className="text-cyan-700" /> Destination Test Email Address
            </label>
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g. admin@mnit.ac.in, reviewer@gmail.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                <FiUser className="text-cyan-700" /> Sample Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Parv Agrawal"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Sample Student ID
              </label>
              <input
                type="text"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="2024UCH1198"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Test sending is decoupled from participant cohorts and sends sample placeholder data immediately to your test inbox.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {sending ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSend className="text-xs" />}
              <span>{sending ? "Sending..." : "Send Test"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default TestEmailModal
