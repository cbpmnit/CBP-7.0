"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useEmailTemplates } from "../hooks/useEmailTemplates"
import { PageHeader } from "@/components/ui/PageHeader"
import EmailPreviewModal from "./EmailPreviewModal"
import TestEmailModal from "./TestEmailModal"
import { NotificationTemplateResponse } from "../types"
import { emailTemplateApi } from "../services/notificationApi"
import {
  FiMail,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiCopy,
  FiSend,
  FiCode,
  FiArchive,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi"

const EVENT_TYPE_LABELS: Record<string, string> = {
  ATTENDANCE_QR_GENERATED: "Attendance QR Pass",
  PAYMENT_SUCCESS: "Payment Confirmation",
  REGISTRATION_SUCCESS: "Registration Welcome",
  CERTIFICATE_ISSUED: "Certificate Issued",
  SESSION_REMINDER: "Session Reminder",
}

export default function EmailManagement() {
  const router = useRouter()
  const {
    loading,
    templates,
    message,
    handleDelete,
    reload,
  } = useEmailTemplates()

  // Expanded variables per card
  const [expandedVariables, setExpandedVariables] = useState<Record<string, boolean>>({})

  // Live Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<NotificationTemplateResponse | null>(null)

  // Test Email Modal state
  const [testEmailOpen, setTestEmailOpen] = useState(false)
  const [testEmailTemplate, setTestEmailTemplate] = useState<NotificationTemplateResponse | null>(null)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleOpenCreateBuilder = () => {
    router.push("/admin/emails/builder")
  }

  const handleOpenEditBuilder = (t: NotificationTemplateResponse) => {
    router.push(`/admin/emails/builder?id=${t.id}`)
  }

  const handleOpenPreview = (t: NotificationTemplateResponse) => {
    setSelectedPreviewTemplate(t)
    setPreviewOpen(true)
  }

  const handleOpenTestEmail = (t: NotificationTemplateResponse) => {
    setTestEmailTemplate(t)
    setTestEmailOpen(true)
  }

  const handlePublishTemplate = async (id: string) => {
    try {
      await emailTemplateApi.publishTemplate(id)
      setToastMessage("Email template published live successfully!")
      setTimeout(() => setToastMessage(null), 3000)
      await reload()
    } catch {
      await reload()
    }
  }

  const handleArchiveTemplate = async (id: string) => {
    try {
      await emailTemplateApi.archiveTemplate(id)
      setToastMessage("Email template archived.")
      setTimeout(() => setToastMessage(null), 3000)
      await reload()
    } catch {
      await reload()
    }
  }

  const handleDuplicateTemplate = async (t: NotificationTemplateResponse) => {
    try {
      await emailTemplateApi.duplicateTemplate(t.id)
      setToastMessage("Email template duplicated as draft!")
      setTimeout(() => setToastMessage(null), 3000)
      await reload()
    } catch {
      router.push(`/admin/emails/builder?id=${t.id}&duplicate=true`)
    }
  }

  const toggleVariableExpansion = (templateId: string) => {
    setExpandedVariables((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }))
  }

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="EMAIL_SEND">
        <div className="space-y-5">
          {/* Header */}
          <PageHeader
            title="Email Template Management"
            count={templates.length}
            countLabel="templates"
            subtitle="Manage automated operational email templates, draft/publish lifecycle, and recipient dispatch tests"
            actions={
              <button
                onClick={handleOpenCreateBuilder}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition shrink-0 cursor-pointer"
              >
                <FiPlus className="text-sm" /> Create Email Template
              </button>
            }
          />

          {(message || toastMessage) && (
            <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
              <span>{toastMessage || message}</span>
            </div>
          )}

          {/* Templates Grid (2-3 cards per row on desktop, 1 on mobile) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-slate-100 rounded-md" />
                    <div className="h-4 w-16 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-5 w-44 bg-slate-200 rounded-md" />
                  <div className="h-3 w-56 bg-slate-100 rounded-md" />
                  <div className="h-10 bg-slate-50 rounded-xl" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-xs space-y-4 max-w-md mx-auto my-8">
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto text-2xl">
                <FiMail />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase text-slate-900">No Email Templates Found</h3>
                <p className="text-xs text-slate-500">
                  Launch the GrapesJS Email Builder to create automated operational templates.
                </p>
              </div>
              <button
                onClick={handleOpenCreateBuilder}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus /> Create Email Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {templates.map((t) => {
                const status = (t.status as any) || "DRAFT"
                const eventTypeKey = t.eventType || t.notificationType || "ATTENDANCE_QR_GENERATED"
                const eventTypeLabel = EVENT_TYPE_LABELS[eventTypeKey] || eventTypeKey

                const rawVars =
                  t.variablesUsed ||
                  (Array.isArray(t.variables)
                    ? t.variables
                    : typeof t.variables === "string"
                    ? (t.variables as string).split(",")
                    : ["studentName", "studentId", "sessionName"])

                const variables = rawVars.filter((v: string) => v && v.trim().length > 0)
                const isExpanded = Boolean(expandedVariables[t.id])
                const visibleVars = isExpanded ? variables : variables.slice(0, 3)
                const hiddenCount = variables.length - 3

                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-slate-300 hover:shadow-md transition group"
                  >
                    {/* 1. Header: Event Type Badge + Status */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200/80 px-2.5 py-1 rounded-lg truncate">
                          {eventTypeLabel}
                        </span>

                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : status === "ARCHIVED"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* 2. Template Identity */}
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition truncate">
                          {t.templateName || t.name}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                          Subject: &quot;{t.subject}&quot;
                        </p>
                      </div>

                      {/* 3. Variables Used (Collapsed to 3-4 with +X more expander) */}
                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <FiCode className="text-cyan-700" /> Variables Used:
                          </span>

                          {hiddenCount > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleVariableExpansion(t.id)}
                              className="text-[10px] font-bold text-cyan-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  Show less <FiChevronUp />
                                </>
                              ) : (
                                <>
                                  +{hiddenCount} more <FiChevronDown />
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {visibleVars.map((v: string) => (
                            <span
                              key={v}
                              className="text-[9px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs"
                            >
                              {"{{" + v.trim() + "}}"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Action Bar (Primary Publish CTA + Secondary Preview/Test/Edit + Tertiary) */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(t)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-cyan-700 transition cursor-pointer"
                        >
                          <FiEye className="text-xs" /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenTestEmail(t)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 transition cursor-pointer"
                        >
                          <FiSend className="text-xs" /> Send Test
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {status === "DRAFT" && (
                          <button
                            type="button"
                            onClick={() => handlePublishTemplate(t.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                            title="Publish Template Live"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditBuilder(t)}
                          className="p-1.5 text-slate-600 hover:text-cyan-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Edit in Template Builder"
                        >
                          <FiEdit3 className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateTemplate(t)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Duplicate Template"
                        >
                          <FiCopy className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveTemplate(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Archive Template"
                        >
                          <FiArchive className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live Preview Modal */}
        {selectedPreviewTemplate && (
          <EmailPreviewModal
            isOpen={previewOpen}
            onClose={() => {
              setPreviewOpen(false)
              setSelectedPreviewTemplate(null)
            }}
            templateName={selectedPreviewTemplate.templateName || selectedPreviewTemplate.name || "Email Template"}
            subject={selectedPreviewTemplate.subject}
            htmlContent={
              selectedPreviewTemplate.htmlContent ||
              selectedPreviewTemplate.content ||
              selectedPreviewTemplate.body ||
              "<p>Email Content</p>"
            }
          />
        )}

        {/* Send Test Email Modal with Student Registry Picker */}
        {testEmailTemplate && (
          <TestEmailModal
            isOpen={testEmailOpen}
            onClose={() => {
              setTestEmailOpen(false)
              setTestEmailTemplate(null)
            }}
            templateId={testEmailTemplate.id}
            templateName={testEmailTemplate.templateName || testEmailTemplate.name || "Email Template"}
          />
        )}
      </PermissionGuard>
    </PageTransition>
  )
}
