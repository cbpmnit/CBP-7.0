"use client"

import React, { useState, useEffect } from "react"
import { NotificationTemplateResponse, NotificationTemplateStats } from "../types"
import { emailTemplateApi } from "../services/notificationApi"
import EmailPreviewModal from "./EmailPreviewModal"
import {
  FiMail,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiCopy,
  FiCode,
  FiArchive,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiSearch,
  FiMoreVertical,
  FiClock,
  FiAlertTriangle,
  FiZap,
  FiPower,
  FiActivity,
  FiFileText,
} from "react-icons/fi"

const EVENT_TYPE_LABELS: Record<string, { label: string; category: string }> = {
  REGISTRATION_SUCCESS: { label: "Registration Welcome", category: "REGISTRATION" },
  PAYMENT_SUCCESS: { label: "Payment Success Receipt", category: "PAYMENT" },
  PAYMENT_FAILED: { label: "Payment Failure Notice", category: "PAYMENT" },
  ATTENDANCE_QR_GENERATED: { label: "Attendance QR Security Pass", category: "ATTENDANCE" },
  CERTIFICATE_ISSUED: { label: "Certificate Released", category: "CERTIFICATE" },
  CERTIFICATE_READY: { label: "Certificate Released", category: "CERTIFICATE" },
  VOLUNTEER_INVITATION: { label: "Volunteer Invitation", category: "VOLUNTEER" },
  VOLUNTEER_ASSIGNED: { label: "Volunteer Privileges Granted", category: "VOLUNTEER" },
  VOLUNTEER_PERMISSIONS_UPDATED: { label: "Volunteer Scopes Updated", category: "VOLUNTEER" },
  VOLUNTEER_ACCESS_REVOKED: { label: "Volunteer Status Notice", category: "VOLUNTEER" },
  SESSION_REMINDER: { label: "Session Reminder", category: "ATTENDANCE" },
  GENERAL_NOTIFICATION: { label: "General Announcement", category: "NOTIFICATION" },
}

interface Props {
  templates: NotificationTemplateResponse[]
  loading: boolean
  onReload: () => Promise<void>
  onOpenCreate: (initialEventType?: string) => void
  onOpenEdit: (template: NotificationTemplateResponse) => void
}

export default function EmailTemplatesTab({
  templates,
  loading,
  onReload,
  onOpenCreate,
  onOpenEdit,
}: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState<"updated" | "name">("updated")

  const [stats, setStats] = useState<NotificationTemplateStats | null>(null)
  const [expandedVariables, setExpandedVariables] = useState<Record<string, boolean>>({})
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<NotificationTemplateResponse | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [templates])

  const fetchStats = async () => {
    try {
      const res = await emailTemplateApi.getTemplateStats()
      if (res) setStats(res)
    } catch {
      // Fallback in-memory stats
      const total = templates.length
      const active = templates.filter((t) => (t.status || "").toUpperCase() === "ACTIVE").length
      const draft = templates.filter((t) => (t.status || "").toUpperCase() === "DRAFT").length
      const published = templates.filter((t) => (t.status || "").toUpperCase() === "PUBLISHED").length
      const archived = templates.filter((t) => (t.status || "").toUpperCase() === "ARCHIVED").length

      const requiredEvents = [
        "REGISTRATION_SUCCESS",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "ATTENDANCE_QR_GENERATED",
        "CERTIFICATE_ISSUED",
        "VOLUNTEER_INVITATION",
        "VOLUNTEER_ASSIGNED",
        "VOLUNTEER_PERMISSIONS_UPDATED",
        "VOLUNTEER_ACCESS_REVOKED",
      ]
      const activeEventKeys = templates
        .filter((t) => (t.status || "").toUpperCase() === "ACTIVE")
        .map((t) => (t.eventType || t.notificationType || "").toUpperCase())

      const missing = requiredEvents.filter((e) => !activeEventKeys.includes(e))

      setStats({
        totalTemplates: total,
        activeTemplates: active,
        draftTemplates: draft,
        publishedTemplates: published,
        archivedTemplates: archived,
        failedDeliveriesCount: 0,
        missingActiveEventTypes: missing,
      })
    }
  }

  const handleOpenPreview = (t: NotificationTemplateResponse) => {
    setSelectedPreviewTemplate(t)
    setPreviewOpen(true)
    setActiveMenuId(null)
  }

  const handleActivateTemplate = async (t: NotificationTemplateResponse) => {
    setActionLoadingId(t.id)
    try {
      await emailTemplateApi.activateTemplate(t.id)
      setToastMessage(`"${t.templateName || t.name}" is now ACTIVE for automated emails!`)
      setTimeout(() => setToastMessage(null), 3500)
      setActiveMenuId(null)
      await onReload()
    } catch (e: any) {
      alert(e?.message || "Failed to activate template.")
      await onReload()
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeactivateTemplate = async (t: NotificationTemplateResponse) => {
    setActionLoadingId(t.id)
    try {
      await emailTemplateApi.deactivateTemplate(t.id)
      setToastMessage(`"${t.templateName || t.name}" is now INACTIVE.`)
      setTimeout(() => setToastMessage(null), 3000)
      setActiveMenuId(null)
      await onReload()
    } catch (e: any) {
      alert(e?.message || "Failed to deactivate template.")
      await onReload()
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleArchiveTemplate = async (id: string) => {
    try {
      await emailTemplateApi.archiveTemplate(id)
      setToastMessage("Email template archived.")
      setTimeout(() => setToastMessage(null), 3000)
      setActiveMenuId(null)
      await onReload()
    } catch {
      await onReload()
    }
  }

  const handleDuplicateTemplate = async (t: NotificationTemplateResponse) => {
    try {
      await emailTemplateApi.duplicateTemplate(t.id)
      setToastMessage("Email template duplicated as draft!")
      setTimeout(() => setToastMessage(null), 3000)
      setActiveMenuId(null)
      await onReload()
    } catch {
      onOpenEdit(t)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this email template?")) return
    try {
      await emailTemplateApi.deleteTemplate(id)
      setToastMessage("Email template deleted.")
      setTimeout(() => setToastMessage(null), 3000)
      setActiveMenuId(null)
      await onReload()
    } catch {
      await onReload()
    }
  }

  const toggleVariableExpansion = (templateId: string) => {
    setExpandedVariables((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }))
  }

  // Filter & Search Logic
  const filteredTemplates = templates.filter((t) => {
    const name = (t.templateName || t.name || "").toLowerCase()
    const subject = (t.subject || "").toLowerCase()
    const eventType = (t.eventType || t.notificationType || "").toLowerCase()
    const searchLower = search.toLowerCase().trim()

    const matchesSearch =
      !searchLower ||
      name.includes(searchLower) ||
      subject.includes(searchLower) ||
      eventType.includes(searchLower)

    const status = (t.status || "DRAFT").toUpperCase()
    const matchesStatus =
      statusFilter === "ALL" ||
      status === statusFilter ||
      (statusFilter === "PUBLISHED" && (status === "PUBLISHED" || status === "ACTIVE"))

    const catInfo = EVENT_TYPE_LABELS[t.eventType || t.notificationType || ""]
    const category = catInfo ? catInfo.category : "NOTIFICATION"
    const matchesCategory = categoryFilter === "ALL" || category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Sorting
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === "name") {
      const nameA = (a.templateName || a.name || "").toLowerCase()
      const nameB = (b.templateName || b.name || "").toLowerCase()
      return nameA.localeCompare(nameB)
    } else {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return dateB - dateA
    }
  })

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recently"
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours < 1) return "Just now"
      if (diffHours === 1) return "1 hour ago"
      if (diffHours < 24) return `${diffHours} hours ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return "Yesterday"
      return `${diffDays} days ago`
    } catch {
      return "Recently"
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
              <FiFileText />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Templates</p>
              <p className="text-lg font-black text-slate-900">{stats.totalTemplates}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg">
              <FiZap />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Active Live</p>
              <p className="text-lg font-black text-emerald-950">{stats.activeTemplates}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-lg">
              <FiClock />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Draft Templates</p>
              <p className="text-lg font-black text-amber-950">{stats.draftTemplates}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center text-lg">
              <FiActivity />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed Delivery Logs</p>
              <p className="text-lg font-black text-slate-900">{stats.failedDeliveriesCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Missing Active Templates Warning Banner */}
      {stats && stats.missingActiveEventTypes && stats.missingActiveEventTypes.length > 0 && (
        <div className="p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-amber-600 text-lg shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                Missing Active Templates ({stats.missingActiveEventTypes.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Automated emails for these triggers will be skipped
            </span>
          </div>
          <p className="text-xs text-amber-800">
            The following system triggers do not have an <strong>ACTIVE</strong> template configured:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {stats.missingActiveEventTypes.map((evt) => (
              <button
                key={evt}
                onClick={() => onOpenCreate(evt)}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-mono font-bold text-[11px] hover:bg-amber-100 transition inline-flex items-center gap-1 cursor-pointer"
              >
                <FiPlus className="text-xs" /> {evt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filters & Sort */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-3 text-slate-400 text-xs pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="REGISTRATION">Registration</option>
              <option value="PAYMENT">Payment</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="NOTIFICATION">Notification</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
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
      ) : sortedTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center shadow-xs space-y-3 max-w-md mx-auto my-6">
          <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto text-2xl">
            <FiMail />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">
              No email templates found.
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Create your first reusable template for automated communication.
            </p>
          </div>
          <button
            onClick={() => onOpenCreate()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FiPlus className="text-sm" /> Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {sortedTemplates.map((t) => {
            const status = ((t.status as any) || "DRAFT").toUpperCase()
            const eventTypeKey = (t.eventType || t.notificationType || "ATTENDANCE_QR_GENERATED").toUpperCase()
            const catInfo = EVENT_TYPE_LABELS[eventTypeKey]
            const categoryBadge = catInfo ? catInfo.category : "NOTIFICATION"
            const templateTitle = t.templateName || t.name || "Email Template"

            const rawVars =
              t.variablesUsed ||
              (Array.isArray(t.variables)
                ? t.variables
                : typeof t.variables === "string"
                ? (t.variables as string).split(",")
                : ["studentName", "studentId"])

            const variables = rawVars.filter((v: string) => v && v.trim().length > 0)
            const isExpanded = Boolean(expandedVariables[t.id])
            const visibleVars = isExpanded ? variables : variables.slice(0, 3)
            const hiddenCount = variables.length - 3
            const isLoadingThis = actionLoadingId === t.id

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl p-4.5 border shadow-xs flex flex-col justify-between space-y-3.5 hover:shadow-md transition group relative ${
                  status === "ACTIVE"
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Top Section */}
                <div className="space-y-2.5">
                  {/* Category + Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200/80 px-2.5 py-0.5 rounded-md truncate">
                      {categoryBadge}
                    </span>

                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                          : status === "PUBLISHED"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : status === "ARCHIVED"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : status === "INACTIVE"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {status === "ACTIVE" && <FiZap className="text-emerald-600 text-xs" />}
                      {status}
                    </span>
                  </div>

                  {/* Template Name & Event Mapping */}
                  <div>
                    <h2 className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition truncate">
                      {templateTitle}
                    </h2>
                    <p className="text-[11px] font-mono text-cyan-800 font-bold mt-0.5 truncate">
                      Event: {eventTypeKey}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Subject: &quot;{t.subject || "No subject set"}&quot;
                    </p>
                  </div>

                  {/* Variables Used */}
                  <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <FiCode className="text-cyan-700" /> Variables:
                      </span>

                      {hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleVariableExpansion(t.id)}
                          className="text-[10px] font-bold text-cyan-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Less <FiChevronUp />
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

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <FiClock className="text-slate-400 text-xs" /> Updated: {formatRelativeTime(t.updatedAt || t.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {status === "ACTIVE" ? (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleDeactivateTemplate(t)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                      >
                        <FiPower className="text-xs text-slate-500" /> Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleActivateTemplate(t)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <FiZap className="text-xs" /> Activate
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenEdit(t)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <FiEdit3 className="text-xs" /> Edit
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(t)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
                      title="Preview Template"
                    >
                      <FiEye className="text-sm" />
                    </button>

                    {/* More Menu Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <FiMoreVertical className="text-sm" />
                      </button>

                      {activeMenuId === t.id && (
                        <div className="absolute right-0 bottom-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs animate-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => handleDuplicateTemplate(t)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer"
                          >
                            <FiCopy className="text-xs" /> Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchiveTemplate(t.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-amber-50 text-amber-800 font-semibold flex items-center gap-2 cursor-pointer"
                          >
                            <FiArchive className="text-xs" /> Archive
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(t.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2 cursor-pointer border-t border-slate-100"
                          >
                            <FiTrash2 className="text-xs" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Live Presentation Preview Modal */}
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
    </div>
  )
}
