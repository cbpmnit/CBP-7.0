"use client"

import { useState, useEffect } from "react"
import { notificationService } from "@/services/notificationService"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
} from "@/types/notification"
import { FiBell, FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi"

const NOTIFICATION_TYPES = [
  "CBP_REGISTRATION_SUCCESSFUL",
  "PAYMENT_SUCCESSFUL",
  "PAYMENT_FAILED",
  "ATTENDANCE_QR_GENERATED",
  "ATTENDANCE_MARKED",
  "DAILY_ATTENDANCE_REPORT",
  "CERTIFICATE_READY",
]

export default function EmailTemplateManager() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<NotificationTemplateResponse[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplateResponse | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)

  const [formData, setFormData] = useState<CreateNotificationTemplateRequest>({
    templateName: "",
    subject: "",
    body: "",
    notificationType: "CBP_REGISTRATION_SUCCESSFUL",
    variables: [],
  })
  const [variablesInput, setVariablesInput] = useState("")

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await notificationService.getAllTemplates()
      setTemplates(data || [])
    } catch (err: any) {
      setMessage(err?.message || "Failed to load notification templates.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditId(null)
    setFormData({
      templateName: "",
      subject: "",
      body: "",
      notificationType: "CBP_REGISTRATION_SUCCESSFUL",
      variables: [],
    })
    setVariablesInput("")
    setModalOpen(true)
  }

  const handleOpenEdit = (t: NotificationTemplateResponse) => {
    setEditId(t.id)
    setFormData({
      templateName: t.templateName,
      subject: t.subject,
      body: t.body,
      notificationType: t.notificationType,
      variables: t.variables || [],
    })
    setVariablesInput((t.variables || []).join(", "))
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification template?")) return
    try {
      await notificationService.deleteTemplate(id)
      setMessage("Template deleted successfully")
      fetchTemplates()
    } catch (err: any) {
      setMessage(err?.message || "Failed to delete template.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setMessage(null)

    const vars = variablesInput
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    const payload = { ...formData, variables: vars }

    try {
      if (editId) {
        await notificationService.updateTemplate(editId, payload)
        setMessage("Notification template updated successfully!")
      } else {
        await notificationService.createTemplate(payload)
        setMessage("Notification template created successfully!")
      }
      setModalOpen(false)
      fetchTemplates()
    } catch (err: any) {
      setMessage(err?.message || "Failed to save template.")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="text-cyan-700 text-base"><FiBell /></span>
            <span>Email Template Management Engine</span>
          </h3>
          <p className="text-xs text-slate-600">Configure automated email triggers, subject lines, and body parameters.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
        >
          <FiPlus /> Create Template
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No email templates created yet. Click 'Create Template' to get started.</p>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {t.notificationType}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{t.templateName}</h4>
                </div>
                <p className="text-xs text-slate-600">Subject: <span className="font-semibold text-slate-800">{t.subject}</span></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition"
                >
                  <FiEye /> Preview
                </button>
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-xs"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition text-xs"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-300 shadow-2xl relative">
            <h4 className="text-base font-bold text-slate-900 mb-1">{previewTemplate.templateName}</h4>
            <p className="text-xs text-slate-500 font-mono mb-4">Subject: {previewTemplate.subject}</p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap mb-4">
              {previewTemplate.body}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editId ? "Edit Notification Template" : "Create Notification Template"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                  placeholder="e.g. Welcome Email"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notification Type</label>
                <select
                  value={formData.notificationType}
                  onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                >
                  {NOTIFICATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                  placeholder="e.g. Welcome {{studentName}}"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Body Template</label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                  placeholder="Dear {{studentName}}, your ID is {{registrationId}}."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Variables (Comma Separated)</label>
                <input
                  type="text"
                  value={variablesInput}
                  onChange={(e) => setVariablesInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                  placeholder="studentName, registrationId"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 rounded-xl bg-slate-100 text-slate-700 py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-1/2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
