"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notificationService } from "@/services/notificationService"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
} from "@/types/notification"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiBell,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi"

const NOTIFICATION_TYPES = [
  "CBP_REGISTRATION_SUCCESSFUL",
  "PAYMENT_SUCCESSFUL",
  "PAYMENT_FAILED",
  "ATTENDANCE_QR_GENERATED",
  "ATTENDANCE_MARKED",
  "DAILY_ATTENDANCE_REPORT",
  "CERTIFICATE_READY",
]

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<NotificationTemplateResponse[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
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
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              <FiArrowLeft /> Admin Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Admin Notification Center
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Notification <span className="gradient-text-cyan">Templates</span>
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage automated email notification templates, placeholder variables, and subjects.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiPlus className="text-base" /> Create Template
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-2xl border bg-cyan-50 border-cyan-200 text-cyan-800 text-xs font-semibold text-center">
              {message}
            </div>
          )}

          {/* Templates Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
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
              <p className="text-xs text-slate-600 mb-4">Click 'Create Template' to configure system email notifications.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {templates.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                        {t.notificationType}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{t.templateName}</h3>
                    <p className="text-xs font-semibold text-slate-700 mb-3">Subject: {t.subject}</p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono mb-4 line-clamp-3">
                      {t.body}
                    </div>

                    {t.variables && t.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {t.variables.map((v) => (
                          <span key={v} className="text-[10px] font-mono bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded text-cyan-800 font-bold">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Create/Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full border border-slate-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {editId ? "Edit Notification Template" : "Create Notification Template"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none"
                    placeholder="e.g. CBP Registration Welcome Email"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Notification Type</label>
                  <select
                    value={formData.notificationType}
                    onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none"
                  >
                    {NOTIFICATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none"
                    placeholder="e.g. Welcome to CBP 7.0 {{studentName}}"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Body Template</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                    placeholder="Dear {{studentName}}, your registration ID is {{registrationId}}."
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
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                    placeholder="studentName, registrationId, qrToken"
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
      </main>
    </PageTransition>
  )
}
