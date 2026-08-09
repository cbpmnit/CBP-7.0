"use client"

import React, { useState, useRef } from "react"
import GrapesJsEmailEditor, { GrapesJsEmailEditorRef } from "./GrapesJsEmailEditor"
import EmailVariablePanel from "./EmailVariablePanel"
import EmailPreviewModal from "./EmailPreviewModal"
import TestEmailModal from "./TestEmailModal"
import { EVENT_TYPE_OPTIONS } from "../constants/emailVariables"
import { EmailEventType, NotificationTemplateResponse } from "../types"
import { FiSave, FiEye, FiSend, FiX, FiRefreshCw, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

interface Props {
  isOpen: boolean
  onClose: () => void
  initialTemplate?: NotificationTemplateResponse | null
  onSave: (data: {
    templateName: string
    subject: string
    body: string
    notificationType: string
    eventType: EmailEventType
    designJson: string
    htmlContent: string
    variablesUsed: string[]
  }) => Promise<void>
}

export function EmailBuilderModal({ isOpen, onClose, initialTemplate, onSave }: Props) {
  const editorRef = useRef<GrapesJsEmailEditorRef>(null)

  const [templateName, setTemplateName] = useState(initialTemplate?.templateName || "")
  const [eventType, setEventType] = useState<EmailEventType>(initialTemplate?.eventType || "ATTENDANCE_QR_GENERATED")
  const [subject, setSubject] = useState(initialTemplate?.subject || "")

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Preview & Test Modals state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const [testEmailOpen, setTestEmailOpen] = useState(false)

  if (!isOpen) return null

  const handleInsertVariable = (key: string) => {
    if (editorRef.current) {
      editorRef.current.insertMergeTag(key)
    }
  }

  const handleOpenPreview = async () => {
    if (editorRef.current) {
      try {
        const { htmlContent } = await editorRef.current.exportHtml()
        setPreviewHtml(htmlContent)
        setPreviewOpen(true)
      } catch (err) {
        setPreviewHtml("<p>Could not export HTML for preview.</p>")
        setPreviewOpen(true)
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateName.trim()) {
      setError("Please enter a template name.")
      return
    }
    if (!subject.trim()) {
      setError("Please enter an email subject line.")
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      let exportData = { designJson: "", htmlContent: "", variablesUsed: [] as string[] }
      if (editorRef.current) {
        exportData = await editorRef.current.exportHtml()
      }

      await onSave({
        templateName,
        subject,
        body: exportData.htmlContent ? exportData.htmlContent.substring(0, 500) : "Visual Email Template",
        notificationType: eventType,
        eventType,
        designJson: exportData.designJson,
        htmlContent: exportData.htmlContent,
        variablesUsed: exportData.variablesUsed,
      })

      setMessage("Email template saved successfully!")
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setError("Failed to save email template. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              {initialTemplate ? "Edit Email Template" : "Create Visual Email Template"}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
              GrapesJS Builder
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleOpenPreview}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FiEye className="text-xs text-cyan-700" /> Preview
            </button>

            <button
              type="button"
              onClick={() => setTestEmailOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FiSend className="text-xs text-purple-700" /> Send Test
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSave className="text-xs" />}
              <span>{saving ? "Saving..." : "Save Template"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer ml-1"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {message && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shrink-0">
            <FiCheckCircle className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 shrink-0">
            <FiAlertCircle className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metadata Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 border-b border-slate-200 shrink-0">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Template Name
            </label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Attendance QR Gate Pass"
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EmailEventType)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-600 cursor-pointer"
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Your CBP 7.0 Gate Pass for {{sessionName}}"
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-600 font-mono"
            />
          </div>
        </div>

        {/* Main Editor & Variable Side Panel Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 min-h-0 overflow-hidden bg-slate-100/50">
          {/* GrapesJS Editor Canvas (3 Cols) */}
          <div className="lg:col-span-3 h-full flex flex-col min-h-0">
            <GrapesJsEmailEditor
              ref={editorRef}
              initialDesignJson={initialTemplate?.designJson}
              initialHtmlContent={initialTemplate?.htmlContent}
            />
          </div>

          {/* Dynamic Variable Registry Panel (1 Col) */}
          <div className="lg:col-span-1 h-full min-h-0">
            <EmailVariablePanel onInsertVariable={handleInsertVariable} />
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      <EmailPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateName={templateName}
        subject={subject}
        htmlContent={previewHtml}
      />

      <TestEmailModal
        isOpen={testEmailOpen}
        onClose={() => setTestEmailOpen(false)}
        templateId={initialTemplate?.id || "temp-1"}
        templateName={templateName || "New Template"}
      />
    </div>
  )
}

export default EmailBuilderModal
