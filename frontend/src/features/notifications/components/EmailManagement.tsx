"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useEmailTemplates, NOTIFICATION_TYPES } from "../hooks/useEmailTemplates"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  FiBell,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCopy,
  FiCheck,
  FiX,
} from "react-icons/fi"

export default function EmailManagement() {
  const {
    loading,
    templates,
    message,
    modalOpen,
    setModalOpen,
    editId,
    saveLoading,
    formData,
    setFormData,
    variablesInput,
    setVariablesInput,
    previewTemplate,
    setPreviewTemplate,
    copiedPreview,
    setCopiedPreview,
    activeStatusMap,
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
    handleToggleStatus,
    handleSubmit,
    renderMockBody,
  } = useEmailTemplates()

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="EMAIL_SEND">
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
            title="Email Templates"
            count={templates.length}
            countLabel="templates"
            subtitle="Automated system email notifications, QR gate passes, payment receipts, and certificates"
            actions={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition shrink-0 cursor-pointer"
              >
                <FiPlus className="text-xs" /> Create Template
              </button>
            }
          />

          {message && (
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold">
              {message}
            </div>
          )}

          {/* Templates Grid */}
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse shadow-2xs">
                  <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-48 bg-slate-100 rounded mb-3" />
                  <div className="h-12 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-2xs">
              <FiBell className="mx-auto text-2xl text-slate-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-900 mb-1">No Notification Templates Found</h3>
              <p className="text-[11px] text-slate-500 mb-4">Click &apos;Create Template&apos; to configure system notifications.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((t) => {
                const isActive = activeStatusMap[t.id] ?? true
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.2 rounded truncate">
                          {t.notificationType || t.templateName}
                        </span>

                        <button
                          onClick={() => handleToggleStatus(t.id)}
                          className="cursor-pointer"
                        >
                          <StatusBadge status={isActive ? "ACTIVE" : "DISABLED"} />
                        </button>
                      </div>

                      <h2 className="text-xs font-bold text-slate-900 truncate">
                        {t.subject || t.templateName}
                      </h2>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        Template ID: {t.templateName}
                      </p>

                      <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 line-clamp-3 font-mono">
                        {t.body}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewTemplate(t)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-cyan-700 cursor-pointer"
                      >
                        <FiEye className="text-xs" /> Preview
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1 text-slate-500 hover:text-cyan-700 rounded hover:bg-slate-50 transition cursor-pointer"
                          title="Edit template"
                        >
                          <FiEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition cursor-pointer"
                          title="Delete template"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Create/Edit Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editId ? "Edit Email Template" : "New Email Template"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Notification Type</label>
                    <select
                      value={formData.notificationType}
                      onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    >
                      {NOTIFICATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={formData.templateName}
                      onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                      placeholder="e.g. Attendance QR Pass Email"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Your CBP 7.0 Gate Pass for {{sessionName}}"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Body</label>
                    <textarea
                      rows={4}
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="e.g. Dear {{studentName}}, your attendance pass for {{sessionName}} is ready."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dynamic Variables (comma separated)</label>
                    <input
                      type="text"
                      value={variablesInput}
                      onChange={(e) => setVariablesInput(e.target.value)}
                      placeholder="e.g. studentName, studentId, amount, transactionId"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      {saveLoading ? "Saving..." : "Save Template"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {previewTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Template Live Preview
                  </h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-500">Subject:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{previewTemplate.subject}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500">Sample Rendered Message:</span>
                    <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700 whitespace-pre-wrap">
                      {renderMockBody(previewTemplate.body)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(renderMockBody(previewTemplate.body))
                      setCopiedPreview(true)
                      setTimeout(() => setCopiedPreview(false), 2000)
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1 text-xs cursor-pointer"
                  >
                    {copiedPreview ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                    <span>{copiedPreview ? "Copied!" : "Copy Text"}</span>
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
