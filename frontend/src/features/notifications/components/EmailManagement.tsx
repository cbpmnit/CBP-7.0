"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useEmailTemplates, NOTIFICATION_TYPES } from "../hooks/useEmailTemplates"
import {
  FiBell,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiCheck,
  FiX,
  FiMail,
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
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        <PermissionGuard requiredPermission="EMAIL_SEND">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <FiMail /> Communication & Notifications
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Email <span className="gradient-text-cyan">Management</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Configure automated student notifications, QR passes, payment receipts, and certificate delivery emails.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition shadow-cyan-600/20 shrink-0"
            >
              <FiPlus className="text-base" /> Create Template
            </button>
          </div>

          {message && (
            <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold text-center">
              {message}
            </div>
          )}

          {/* Templates Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse shadow-sm">
                  <div className="h-6 w-40 bg-slate-100 rounded mb-3" />
                  <div className="h-4 w-64 bg-slate-100 rounded mb-4" />
                  <div className="h-20 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
              <FiBell className="mx-auto text-4xl text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Notification Templates Found</h3>
              <p className="text-xs text-slate-600 mb-4">Click &apos;Create Template&apos; to configure system email notifications.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {templates.map((t) => {
                const isActive = activeStatusMap[t.id] !== undefined ? activeStatusMap[t.id] : true
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                            {t.notificationType}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(t.id)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 transition ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {isActive ? <FiCheckCircle /> : <FiXCircle />}
                            <span>{isActive ? "Active" : "Deactivated"}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewTemplate(t)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition border border-slate-200"
                            title="Preview rendered email"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition border border-slate-200"
                            title="Edit template"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200"
                            title="Delete template"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1">{t.templateName}</h3>
                      <p className="text-xs font-semibold text-slate-700 mb-3">
                        Subject: <span className="font-normal text-slate-600">{t.subject}</span>
                      </p>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono mb-4 line-clamp-3 whitespace-pre-line">
                        {t.body}
                      </div>

                      {t.variables && t.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {t.variables.map((v) => (
                            <span
                              key={v}
                              className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* MODAL 1: Create / Edit Template */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
                >
                  <FiX className="text-xl" />
                </button>

                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {editId ? "Edit Email Template" : "Create Email Template"}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Configure dynamic email template parameters and body placeholders.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Template Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.templateName}
                      onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                      placeholder="e.g. Workshop Gate Pass Passcode"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Notification Type *</label>
                    <select
                      value={formData.notificationType}
                      onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-medium"
                    >
                      {NOTIFICATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                      placeholder="e.g. Your CBP 7.0 Pass for {{sessionName}}"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Body Template *</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-mono"
                      placeholder="Dear {{studentName}}, your pass is ready: {{qrLink}}"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Variables (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={variablesInput}
                      onChange={(e) => setVariablesInput(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-mono"
                      placeholder="studentName, sessionName, sessionDate, qrLink"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="w-1/2 rounded-xl bg-slate-100 border border-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="w-1/2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                    >
                      {saveLoading ? "Saving..." : "Save Template"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: Live HTML / Text Email Preview */}
          {previewTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
                >
                  <FiX className="text-xl" />
                </button>

                <div>
                  <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase tracking-wider">
                    Rendered Email Preview
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{previewTemplate.templateName}</h3>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Subject</span>
                    <p className="text-slate-900 font-bold mt-0.5">
                      {renderMockBody(previewTemplate.subject)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Rendered Email Body</span>
                    <div className="mt-2 p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-line shadow-sm">
                      {renderMockBody(previewTemplate.body)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(renderMockBody(previewTemplate.body))
                      setCopiedPreview(true)
                      setTimeout(() => setCopiedPreview(false), 2000)
                    }}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedPreview ? <FiCheck className="text-emerald-300" /> : <FiCopy />}
                    <span>{copiedPreview ? "Copied Mock Body!" : "Copy Rendered Email"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </PermissionGuard>
      </main>
    </PageTransition>
  )
}
