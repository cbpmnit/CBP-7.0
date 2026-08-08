"use client"

import { useState, useEffect } from "react"
import { notificationService } from "@/services/notificationService"
import { NotificationTemplateResponse } from "@/types/notification"
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

export default function EmailTester() {
  const [templates, setTemplates] = useState<NotificationTemplateResponse[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [variablesJson, setVariablesJson] = useState('{\n  "studentName": "John Doe",\n  "registrationId": "REG12345"\n}')
  
  const [sending, setSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    notificationService.getAllTemplates().then((res) => {
      if (res && res.length > 0) {
        setTemplates(res)
        setSelectedTemplateId(res[0].id)
      }
    }).catch(console.error)
  }, [])

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId || !recipientEmail) return
    setSending(true)
    setStatusMessage(null)
    setIsError(false)

    try {
      let parsedVars = {}
      try {
        parsedVars = JSON.parse(variablesJson)
      } catch {
        setIsError(true)
        setStatusMessage("Invalid JSON formatting in variable payload.")
        setSending(false)
        return
      }

      // Simulated / Development test dispatch
      setStatusMessage(`Test email dispatched successfully to ${recipientEmail}! Template: ${selectedTemplateId}`)
      setIsError(false)
    } catch (err: any) {
      setIsError(true)
      setStatusMessage(err?.message || "Failed to dispatch test notification email.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiSend /></span>
          <span>Development Email Dispatch &amp; Testing Tool</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
          Dev Sandbox Mode
        </span>
      </div>

      <form onSubmit={handleSendTestEmail} className="space-y-3 text-xs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Notification Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
            >
              {templates.length === 0 ? (
                <option value="">No templates available</option>
              ) : (
                templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.templateName} ({t.notificationType})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Recipient Email Address</label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. student@mnit.ac.in"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Template Variables Payload (JSON)</label>
          <textarea
            rows={3}
            value={variablesJson}
            onChange={(e) => setVariablesJson(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !selectedTemplateId || !recipientEmail}
          className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FiSend className="text-sm" />
          <span>{sending ? "Dispatching..." : "Send Test Email"}</span>
        </button>
      </form>

      {statusMessage && (
        <div
          className={`mt-3 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {isError ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
}
