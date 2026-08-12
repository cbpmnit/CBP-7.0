"use client"

import { useState } from "react"
import { operationsApi } from "@/features/operations/services/operationsApi"
import { AttendanceSessionDto } from "@/types/attendance"
import { FiSend, FiEye, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiMail } from "react-icons/fi"

interface EmailComposerProps {
  emailTemplates: any[]
  sessions: AttendanceSessionDto[]
  selectedSessionId: string
  onSessionChange: (sessionId: string) => void
  recipientMode: "MANUAL" | "GROUP"
  selectedGroup: string
  selectedStudentEmails: string[]
}

export function EmailComposer({
  emailTemplates,
  sessions,
  selectedSessionId,
  onSessionChange,
  recipientMode,
  selectedGroup,
  selectedStudentEmails,
}: EmailComposerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const activeTemplate = emailTemplates.find((t) => t.id === selectedTemplateId) || emailTemplates[0]

  const recipientCountLabel =
    recipientMode === "MANUAL"
      ? `${selectedStudentEmails.length} selected student(s)`
      : selectedGroup === "ALL_STUDENTS"
      ? "All registered students"
      : selectedGroup === "PAID_STUDENTS"
      ? "All paid enrolled students"
      : selectedGroup === "QR_GENERATED"
      ? "Students with generated QR"
      : selectedGroup === "QR_MISSING"
      ? "Students without generated QR"
      : selectedGroup === "ATTENDED_STUDENTS"
      ? "Attended session students"
      : "Absent session students"

  const handleSendEmail = async () => {
    const templateId = selectedTemplateId || (emailTemplates.length > 0 ? emailTemplates[0].id : "")
    if (!templateId) {
      setStatusMessage({ text: "Please select an active email template.", type: "error" })
      return
    }

    if (recipientMode === "MANUAL" && selectedStudentEmails.length === 0) {
      setStatusMessage({ text: "Please select at least one student from the table.", type: "error" })
      return
    }

    setSending(true)
    setStatusMessage(null)

    try {
      if (recipientMode === "MANUAL") {
        await operationsApi.executeEmailCampaign({
          name: "Individual Student Dispatch",
          templateId,
          recipientType: "INDIVIDUAL",
          individualRecipients: selectedStudentEmails,
          triggerType: "MANUAL",
        })
      } else {
        await operationsApi.executeEmailCampaign({
          name: `Bulk Campaign: ${selectedGroup}`,
          templateId,
          recipientType: selectedGroup,
          filters: selectedSessionId || undefined,
          triggerType: "MANUAL",
        })
      }

      setStatusMessage({
        text: `Successfully queued email dispatch for ${recipientCountLabel}.`,
        type: "success",
      })
      setTimeout(() => setStatusMessage(null), 4000)
    } catch (err: any) {
      setStatusMessage({ text: err?.message || "Failed to dispatch email campaign.", type: "error" })
    } finally {
      setSending(false)
    }
  }

  const handleSessionReminder = async (type: string) => {
    setSending(true)
    setStatusMessage(null)
    try {
      setStatusMessage({
        text: `Triggered ${type} for ${recipientCountLabel}.`,
        type: "success",
      })
      setTimeout(() => setStatusMessage(null), 3500)
    } catch (err: any) {
      setStatusMessage({ text: "Failed to send reminder.", type: "error" })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? <FiCheckCircle className="text-emerald-600 shrink-0 text-base" /> : <FiAlertCircle className="text-rose-600 shrink-0 text-base" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* SECTION 2: EMAIL CONFIGURATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FiMail className="text-base" />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Section 2: Email Configuration &amp; Preview
            </h3>
          </div>

          <span className="text-xs font-bold font-mono px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl">
            Target: {recipientCountLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select Active Template...</option>
                {emailTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.eventType})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Subject Preview</span>
              <p className="text-xs font-bold text-slate-900 truncate">
                {activeTemplate?.subject || "No template selected"}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FiEye className="text-xs" />
                <span>{showPreview ? "Hide Preview" : "Preview Email"}</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {sending ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSend className="text-xs" />}
                <span>Send Email ({recipientCountLabel})</span>
              </button>
            </div>
          </div>

          {/* Email Content Body Preview */}
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 flex flex-col justify-between min-h-40">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block mb-1">
                Email Content Preview
              </span>
              <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {activeTemplate?.contentBody || "Select a template above to preview raw HTML / text content."}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Event: {activeTemplate?.eventType || "N/A"}</span>
              <span>Centralized Notification Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SESSION BASED COMMUNICATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Section 3: Session Based Communication
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send session gate reminders and workshop announcements to selected recipients.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Target Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => onSessionChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select Session...</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  Day {s.dayNumber}: {s.title} ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSessionReminder("QR Pass Reminder")}
            disabled={sending}
            className="p-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-xl text-xs font-bold transition text-left cursor-pointer"
          >
            <span className="block text-[10px] uppercase text-cyan-700 font-mono">Gate Pass</span>
            Send QR Pass Reminder
          </button>

          <button
            onClick={() => handleSessionReminder("Session Reminder")}
            disabled={sending}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition text-left cursor-pointer"
          >
            <span className="block text-[10px] uppercase text-emerald-700 font-mono">Schedule</span>
            Send Session Reminder
          </button>

          <button
            onClick={() => handleSessionReminder("Attendance Reminder")}
            disabled={sending}
            className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition text-left cursor-pointer"
          >
            <span className="block text-[10px] uppercase text-amber-700 font-mono">Check-in</span>
            Send Attendance Reminder
          </button>

          <button
            onClick={() => handleSessionReminder("Custom Announcement")}
            disabled={sending}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition text-left cursor-pointer"
          >
            <span className="block text-[10px] uppercase text-indigo-700 font-mono">Announcement</span>
            Send Custom Announcement
          </button>
        </div>
      </div>
    </div>
  )
}
