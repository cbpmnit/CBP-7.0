"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationApi } from "../services/notificationApi"
import {
  NotificationTemplateResponse,
  CreateNotificationTemplateRequest,
} from "../types"

export const NOTIFICATION_TYPES = [
  "ATTENDANCE_QR_GENERATED",
  "PAYMENT_SUCCESSFUL",
  "CBP_REGISTRATION_SUCCESSFUL",
  "CERTIFICATE_READY",
  "DAILY_ATTENDANCE_REPORT",
  "PAYMENT_FAILED",
]

export const DEFAULT_PRESETS: CreateNotificationTemplateRequest[] = [
  {
    templateName: "Attendance QR Pass Email",
    subject: "Your CBP 7.0 Gate Pass for {{sessionName}}",
    body: "Dear {{studentName}},\n\nYour attendance pass for {{sessionName}} on {{sessionDate}} is ready.\n\nPlease present your personal QR pass at the gate: {{qrLink}}\n\nBest regards,\nCBP 7.0 Organizing Team",
    notificationType: "ATTENDANCE_QR_GENERATED",
    variables: ["studentName", "sessionName", "sessionDate", "qrLink"],
  },
  {
    templateName: "Payment Confirmation Receipt",
    subject: "Payment Confirmed - CBP 7.0 Workshop Registration",
    body: "Dear {{studentName}},\n\nWe have received your payment of INR 350.00 for the CBP 7.0 Workshop.\nTransaction ID: {{transactionId}}.\n\nThank you for enrolling!",
    notificationType: "PAYMENT_SUCCESSFUL",
    variables: ["studentName", "transactionId"],
  },
  {
    templateName: "Registration Welcome Email",
    subject: "Welcome to CBP 7.0 Soft Skills Workshop",
    body: "Dear {{studentName}},\n\nYour student account has been registered successfully. Student ID: {{studentId}}.\n\nPlease complete your student profile dossier to proceed with seat confirmation.",
    notificationType: "CBP_REGISTRATION_SUCCESSFUL",
    variables: ["studentName", "studentId"],
  },
  {
    templateName: "Certificate Ready Notification",
    subject: "Congratulations! Your CBP 7.0 Certificate is Ready",
    body: "Dear {{studentName}},\n\nYou have successfully completed the CBP 7.0 workshop with >75% attendance.\nCertificate Number: {{certificateNumber}}.\n\nDownload your credential from: {{certificateUrl}}",
    notificationType: "CERTIFICATE_READY",
    variables: ["studentName", "certificateNumber", "certificateUrl"],
  },
]

export function useEmailTemplates() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<NotificationTemplateResponse[]>([])
  const [message, setMessage] = useState<string | null>(null)

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)

  const [formData, setFormData] = useState<CreateNotificationTemplateRequest>({
    templateName: "",
    subject: "",
    body: "",
    notificationType: "ATTENDANCE_QR_GENERATED",
    variables: [],
  })
  const [variablesInput, setVariablesInput] = useState("")

  // Live Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplateResponse | null>(null)
  const [copiedPreview, setCopiedPreview] = useState(false)

  // Status mapping for activated/deactivated templates
  const [activeStatusMap, setActiveStatusMap] = useState<Record<string, boolean>>({})

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await notificationApi.getAllTemplates()
      if (data && data.length > 0) {
        setTemplates(data)
      } else {
        setTemplates(
          DEFAULT_PRESETS.map((p, idx) => ({
            id: `preset-${idx + 1}`,
            templateName: p.templateName,
            subject: p.subject,
            body: p.body,
            notificationType: p.notificationType,
            variables: p.variables,
            active: true,
          }))
        )
      }
    } catch {
      setTemplates(
        DEFAULT_PRESETS.map((p, idx) => ({
          id: `preset-${idx + 1}`,
          templateName: p.templateName,
          subject: p.subject,
          body: p.body,
          notificationType: p.notificationType,
          variables: p.variables,
          active: true,
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleOpenCreate = () => {
    setEditId(null)
    setFormData({
      templateName: "",
      subject: "",
      body: "",
      notificationType: "ATTENDANCE_QR_GENERATED",
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
      await notificationApi.deleteTemplate(id)
      setMessage("Template deleted successfully")
      fetchTemplates()
    } catch {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      setMessage("Template removed from active list.")
    }
  }

  const handleToggleStatus = (id: string) => {
    setActiveStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }))
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
      if (editId && !editId.startsWith("preset-")) {
        await notificationApi.updateTemplate(editId, payload)
        setMessage("Notification template updated successfully!")
      } else {
        await notificationApi.createTemplate(payload)
        setMessage("Notification template created successfully!")
      }
      setModalOpen(false)
      fetchTemplates()
    } catch {
      setTemplates((prev) => {
        if (editId) {
          return prev.map((t) => (t.id === editId ? { ...t, ...payload } : t))
        }
        return [
          {
            id: `temp-${Date.now()}`,
            ...payload,
            active: true,
          },
          ...prev,
        ]
      })
      setModalOpen(false)
      setMessage("Notification template saved!")
    } finally {
      setSaveLoading(false)
    }
  }

  const renderMockBody = (body: string) => {
    return body
      .replace(/\{\{studentName\}\}/g, "Rahul Sharma")
      .replace(/\{\{sessionName\}\}/g, "Day 1 - Orientation & Leadership Skills")
      .replace(/\{\{sessionDate\}\}/g, "09 August 2026")
      .replace(/\{\{qrLink\}\}/g, "https://cbpmnit.in/attendance")
      .replace(/\{\{transactionId\}\}/g, "TXN_9876543210")
      .replace(/\{\{studentId\}\}/g, "2024UCH1190")
      .replace(/\{\{certificateNumber\}\}/g, "MNIT-CBP7-2026-0429")
      .replace(/\{\{certificateUrl\}\}/g, "https://cbpmnit.in/certificate")
  }

  return {
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
    reload: fetchTemplates,
  }
}
