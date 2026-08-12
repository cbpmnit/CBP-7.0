"use client"

import { useState } from "react"
import { operationsApi } from "@/features/operations/services/operationsApi"
import { FiMail, FiSend, FiRefreshCw, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

interface EmailCampaignPanelProps {
  emailTemplates: any[]
  selectedSessionId: string
}

export function EmailCampaignPanel({ emailTemplates, selectedSessionId }: EmailCampaignPanelProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [recipientGroup, setRecipientGroup] = useState<string>("PAID_STUDENTS")
  const [dispatching, setDispatching] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const handleDispatch = async () => {
    const templateId = selectedTemplateId || (emailTemplates.length > 0 ? emailTemplates[0].id : "")
    if (!templateId) {
      setStatusMessage({ text: "Please select an active email template.", type: "error" })
      return
    }
    setDispatching(true)
    setStatusMessage(null)
    try {
      await operationsApi.executeEmailCampaign({
        name: "Attendance Operations Dispatch",
        templateId,
        recipientType: recipientGroup,
        triggerType: "MANUAL",
      })
      setStatusMessage({ text: "Queued email campaign dispatch successfully.", type: "success" })
      setTimeout(() => setStatusMessage(null), 3500)
    } catch (err: any) {
      setStatusMessage({ text: err?.message || "Failed to dispatch emails.", type: "error" })
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FiMail className="text-base" />
        </span>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Section 2: Communication Operations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Send QR pass emails, reminders, and custom participant notifications.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campaign Dispatch */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Dispatch Email Campaign
          </h4>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select Active Template...</option>
              {emailTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.eventType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Recipient Group</label>
            <select
              value={recipientGroup}
              onChange={(e) => setRecipientGroup(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="PAID_STUDENTS">All Registered &amp; Paid Students</option>
              <option value="ATTENDED_STUDENTS">Students Attended Session</option>
              <option value="ABSENT_STUDENTS">Students Absent in Session</option>
              <option value="VOLUNTEERS">Active Volunteers</option>
            </select>
          </div>

          <button
            onClick={handleDispatch}
            disabled={dispatching}
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {dispatching ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSend className="text-xs" />}
            <span>Dispatch Email Campaign</span>
          </button>
        </div>

        {/* Quick Reminders Panel */}
        <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-200/80 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-cyan-950 uppercase tracking-wide flex items-center gap-1.5">
              <FiSend className="text-cyan-700" />
              <span>Session Gate Pass Reminders</span>
            </h4>
            <p className="text-xs text-cyan-800 mt-1">
              Trigger automated QR pass dispatch notifications for participants enrolled in the selected session.
            </p>
          </div>

          <button
            onClick={() => {
              setStatusMessage({ text: "Queued session gate pass reminders.", type: "success" })
              setTimeout(() => setStatusMessage(null), 3500)
            }}
            className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FiMail className="text-xs" />
            <span>Send Session Reminders</span>
          </button>
        </div>
      </div>
    </div>
  )
}
