"use client"

import React, { useState, useRef, useEffect } from "react"
import EmailPreviewModal from "./EmailPreviewModal"
import { EMAIL_VARIABLES } from "../constants/emailVariables"
import { EmailEventType, NotificationTemplateResponse } from "../types"
import {
  FiSave,
  FiEye,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCode,
  FiCheck,
  FiLayers,
} from "react-icons/fi"

const CATEGORY_OPTIONS: { label: string; value: EmailEventType }[] = [
  { label: "Attendance Pass (ATTENDANCE)", value: "ATTENDANCE_QR_GENERATED" },
  { label: "Payment Receipt (PAYMENT)", value: "PAYMENT_SUCCESS" },
  { label: "Registration Welcome (REGISTRATION)", value: "REGISTRATION_SUCCESS" },
  { label: "Certificate Issued (CERTIFICATE)", value: "CERTIFICATE_ISSUED" },
  { label: "Session Reminder (ATTENDANCE)", value: "SESSION_REMINDER" },
]

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
    htmlContent: string
    variablesUsed: string[]
    status: "DRAFT" | "PUBLISHED"
  }) => Promise<void>
}

export default function EmailBuilderModal({ isOpen, onClose, initialTemplate, onSave }: Props) {
  const [templateName, setTemplateName] = useState("")
  const [eventType, setEventType] = useState<EmailEventType>("ATTENDANCE_QR_GENERATED")
  const [subject, setSubject] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [activeTab, setActiveTab] = useState<"visual" | "code">("visual")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Live Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialTemplate) {
      setTemplateName(initialTemplate.templateName || initialTemplate.name || "")
      setEventType((initialTemplate.eventType || initialTemplate.notificationType || "ATTENDANCE_QR_GENERATED") as EmailEventType)
      setSubject(initialTemplate.subject || "")
      setHtmlContent(
        initialTemplate.htmlContent ||
        initialTemplate.content ||
        initialTemplate.body ||
        getSampleTemplateHtml(initialTemplate.eventType || "ATTENDANCE_QR_GENERATED")
      )
    } else {
      setTemplateName("")
      setEventType("ATTENDANCE_QR_GENERATED")
      setSubject("Your CBP 7.0 Gate Pass for {{sessionName}}")
      setHtmlContent(getSampleTemplateHtml("ATTENDANCE_QR_GENERATED"))
    }
  }, [initialTemplate, isOpen])

  if (!isOpen) return null

  function getSampleTemplateHtml(type: string): string {
    return `<div style="max-w: 600px; margin: 0 auto; background: #ffffff; padding: 32px; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase;">MNIT Jaipur — CBP 7.0</h2>
    <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px; font-weight: 600;">Capacity Building Program</p>
  </div>

  <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 12px 0;">Hello {{studentName}},</h3>
  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
    Your official attendance gate pass for <strong>{{sessionName}}</strong> is active. Please present this QR pass at the VLTC Auditorium entrance.
  </p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
    <p style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin: 0 0 12px 0;">Official Entry QR Pass</p>
    <img src="{{qrCode}}" alt="Gate QR Pass" style="width: 160px; height: 160px; margin: 0 auto; display: block; border-radius: 8px;" />
    <p style="font-family: monospace; font-size: 12px; font-weight: 700; color: #0284c7; margin: 12px 0 0 0;">Student ID: {{studentId}}</p>
  </div>

  <div style="border-t: 1px solid #e2e8f0; pt-16; text-align: center; color: #94a3b8; font-size: 11px;">
    <p style="margin: 0;">Department of Humanities & Social Sciences & Training & Placement Cell, MNIT Jaipur</p>
  </div>
</div>`
  }

  const handleInsertVariable = (varKey: string) => {
    const tag = `{{${varKey}}}`
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const text = textareaRef.current.value
      const newText = text.substring(0, start) + tag + text.substring(end)
      setHtmlContent(newText)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(start + tag.length, start + tag.length)
        }
      }, 50)
    } else {
      setHtmlContent((prev) => prev + " " + tag)
    }
  }

  const handleSaveFlow = async (status: "DRAFT" | "PUBLISHED") => {
    if (!templateName.trim()) {
      setError("Please enter a template name.")
      return
    }
    if (!subject.trim()) {
      setError("Please enter an email subject line.")
      return
    }

    setSaving(true)
    setError(null)

    // Extract used variables
    const matches = htmlContent.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || []
    const variablesUsed = Array.from(
      new Set(matches.map((m) => m.replace(/[\{\}\s]/g, "")))
    )

    try {
      await onSave({
        templateName: templateName.trim(),
        subject: subject.trim(),
        body: htmlContent,
        notificationType: eventType,
        eventType,
        htmlContent,
        variablesUsed,
        status,
      })
      onClose()
    } catch (err: any) {
      setError(err?.message || "Failed to save email template.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              {initialTemplate ? "Edit Email Template" : "Create New Email Template"}
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure template variables, design, and subject header
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <FiAlertCircle className="text-rose-600 shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Template Info Grid */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                required
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Student Attendance QR Pass"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category / Event *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EmailEventType)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-600 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Your CBP 7.0 Gate Pass for {{sessionName}}"
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          {/* Section 2: Variable Insertion Palette */}
          <div className="bg-cyan-50/60 p-3 rounded-xl border border-cyan-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-900 flex items-center gap-1">
                <FiCode className="text-cyan-700" /> Insert Dynamic Variable (Click to Insert):
              </span>
              <span className="text-[10px] text-cyan-700 font-mono">Appends to body or cursor</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {EMAIL_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => handleInsertVariable(v.key)}
                  className="px-2 py-1 bg-white hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-lg text-[10px] font-mono font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                  title={`${v.label}: ${v.description}`}
                >
                  <span>{"{{" + v.key + "}}"}</span>
                  <span className="text-[9px] text-slate-400 font-sans">({v.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Body Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-slate-700">
                Email HTML / Body Template
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("visual")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    activeTab === "visual" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Visual Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    activeTab === "code" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Raw HTML
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows={12}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full rounded-xl bg-slate-950 text-slate-100 font-mono text-xs p-3.5 border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
              placeholder="Write or paste HTML email body..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <FiEye className="text-xs" /> Live Preview
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveFlow("DRAFT")}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FiSave className="text-xs" /> Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveFlow("PUBLISHED")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FiCheck className="text-xs" /> Publish Template
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Overlay */}
      {previewOpen && (
        <EmailPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          templateName={templateName || "New Template"}
          subject={subject}
          htmlContent={htmlContent}
        />
      )}
    </div>
  )
}
