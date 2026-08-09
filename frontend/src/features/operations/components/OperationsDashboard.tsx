"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import { PageHeader } from "@/components/ui/PageHeader"
import { operationsApi, AdminOperationsOverviewDto } from "../services/operationsApi"
import {
  FiSliders,
  FiCheckCircle,
  FiAlertTriangle,
  FiAward,
  FiMail,
  FiPlay,
  FiXCircle,
  FiRefreshCw,
  FiChevronRight,
  FiInfo,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiCamera,
  FiExternalLink,
  FiSend,
} from "react-icons/fi"

export default function OperationsDashboard() {
  const [overview, setOverview] = useState<AdminOperationsOverviewDto | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Actions states
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [recipientType, setRecipientType] = useState<string>("PAID_STUDENTS")
  
  // Feedback
  const [statusMessage, setStatusMessage] = useState<{
    text: string
    type: "success" | "error" | "info"
  } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [overviewRes, sessionsRes, templatesRes] = await Promise.all([
        operationsApi.getOverview(),
        operationsApi.getAllSessions(),
        operationsApi.getEmailTemplates(),
      ])
      
      setOverview(overviewRes)
      setSessions(sessionsRes || [])
      
      const templates = templatesRes || []
      setEmailTemplates(templates)
      if (templates.length > 0) {
        setSelectedTemplateId(templates[0].id)
      }
      
      // Auto select first upcoming session if no active session
      const upcoming = (sessionsRes || []).find((s: any) => s.status === "UPCOMING")
      if (upcoming) {
        setSelectedSessionId(upcoming.id)
      }
    } catch (err: any) {
      console.error("Failed to load operations data", err)
      setStatusMessage({
        text: "Error loading operational data. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    loadData()
    setStatusMessage({ text: "Operational dashboard data updated.", type: "success" })
    setTimeout(() => setStatusMessage(null), 3000)
  }

  // Session Actions
  const handleActivateSession = async () => {
    if (!selectedSessionId) return
    setActionLoading("activate-session")
    setStatusMessage(null)
    try {
      await operationsApi.activateSession(selectedSessionId)
      setStatusMessage({ text: "Session activated successfully.", type: "success" })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to activate session", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    setActionLoading("close-session")
    setStatusMessage(null)
    try {
      await operationsApi.closeSession(sessionId)
      setStatusMessage({ text: "Session closed successfully.", type: "success" })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to close session", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEnableQr = async (sessionId: string) => {
    setActionLoading("enable-qr")
    setStatusMessage(null)
    try {
      await operationsApi.generateSessionQr(sessionId)
      setStatusMessage({ text: "QR check-in enabled successfully.", type: "success" })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to enable QR scanning", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisableQr = async (sessionId: string) => {
    setActionLoading("disable-qr")
    setStatusMessage(null)
    try {
      await operationsApi.deactivateSessionQr(sessionId)
      setStatusMessage({ text: "QR check-in disabled successfully.", type: "success" })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to disable QR scanning", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  // Certificate Actions
  const handleGenerateCertificates = async () => {
    setActionLoading("generate-certs")
    setStatusMessage(null)
    try {
      const res = await operationsApi.generateAllCertificates()
      setStatusMessage({
        text: `Successfully generated ${res?.length || 0} certificates for eligible students.`,
        type: "success",
      })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to generate certificates", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePublishCertificates = async () => {
    setActionLoading("publish-certs")
    setStatusMessage(null)
    try {
      const res = await operationsApi.publishAllCertificates()
      setStatusMessage({
        text: `Successfully published ${res?.length || 0} certificates. They are now downloadable by students.`,
        type: "success",
      })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to publish certificates", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  // Email Campaign Action
  const handleSendEmails = async () => {
    if (!selectedTemplateId) return
    setActionLoading("send-emails")
    setStatusMessage(null)
    const selectedTemplate = emailTemplates.find(t => t.id === selectedTemplateId)
    try {
      await operationsApi.executeEmailCampaign({
        name: `Campaign - ${selectedTemplate?.templateName || "Event Broadcast"} - ${new Date().toLocaleDateString()}`,
        templateId: selectedTemplateId,
        recipientType: recipientType,
        triggerType: "MANUAL",
      })
      setStatusMessage({
        text: `Email campaign dispatched successfully to group: ${recipientType}.`,
        type: "success",
      })
      await loadData()
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || "Failed to dispatch email campaign", type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Control Center...</span>
      </div>
    )
  }

  const upcomingSessionsList = sessions.filter(s => s.status === "UPCOMING")

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Operations Control Center"
          subtitle="Execute live event workflows, configure check-ins, manage notifications, and dispatch credentials."
          actions={
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer active-press"
            >
              <FiRefreshCw className={`text-xs ${actionLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          }
        />

        {/* Status Feedback Banners */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 shadow-2xs ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : statusMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : "bg-cyan-50 border-cyan-200 text-cyan-950"
            }`}
          >
            {statusMessage.type === "success" ? (
              <FiCheckCircle className="text-base text-emerald-600 shrink-0" />
            ) : statusMessage.type === "error" ? (
              <FiXCircle className="text-base text-rose-600 shrink-0" />
            ) : (
              <FiInfo className="text-base text-cyan-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* SECTION 1: EVENT READINESS STATUS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
            Event Readiness
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Registration",
                ready: overview?.registrationOpen,
                configUrl: "/admin/students",
                successText: "Registered",
                errText: "Empty List",
              },
              {
                label: "Payments Gate",
                ready: overview?.paymentGatewayActive,
                configUrl: "/admin/payments",
                successText: "Active",
                errText: "Inactive",
              },
              {
                label: "Sessions Config",
                ready: overview?.sessionsConfigured,
                configUrl: "/admin/sessions",
                successText: "Configured",
                errText: "Missing",
              },
              {
                label: "Attendance System",
                ready: overview?.attendanceSystemReady,
                configUrl: "/admin/attendance",
                successText: "Ready",
                errText: "Setup Required",
              },
              {
                label: "Cert Template",
                ready: overview?.certificateTemplatePublished,
                configUrl: "/admin/certificates",
                successText: "Published",
                errText: "Not Configured",
              },
              {
                label: "Email Templates",
                ready: overview?.emailTemplatesReady,
                configUrl: "/admin/emails",
                successText: "Ready",
                errText: "Configure",
              },
            ].map((check, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl border flex flex-col justify-between h-20 ${
                  check.ready ? "bg-emerald-50/30 border-emerald-100" : "bg-amber-50/30 border-amber-100"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {check.label}
                  </span>
                  {check.ready ? (
                    <FiCheckCircle className="text-xs text-emerald-600 shrink-0" />
                  ) : (
                    <FiAlertTriangle className="text-xs text-amber-600 shrink-0" />
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span
                    className={`text-[11px] font-extrabold truncate ${
                      check.ready ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {check.ready ? check.successText : check.errText}
                  </span>
                  {!check.ready && (
                    <Link
                      href={check.configUrl}
                      className="text-[9px] font-extrabold uppercase text-cyan-700 hover:underline shrink-0"
                    >
                      Configure
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: EVENT FLOW VISUALIZATION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
            CBP Program Stage Pipeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 relative">
            {[
              {
                title: "1. Registration",
                icon: <FiUsers />,
                desc: `${overview?.registeredCount || 0} registered`,
                actionLabel: "View Students",
                href: "/admin/students",
              },
              {
                title: "2. Payments",
                icon: <FiCreditCard />,
                desc: `${overview?.paidCount || 0} paid`,
                actionLabel: "View Payments",
                href: "/admin/payments",
              },
              {
                title: "3. Sessions",
                icon: <FiCalendar />,
                desc: `${overview?.sessionsConfiguredCount || 0} configured`,
                actionLabel: "Manage Sessions",
                href: "/admin/sessions",
              },
              {
                title: "4. Attendance",
                icon: <FiCamera />,
                desc: `Today: ${overview?.attendancePresentCount || 0} present`,
                actionLabel: "Open Attendance",
                href: "/admin/attendance",
              },
              {
                title: "5. Certificates",
                icon: <FiAward />,
                desc: `${overview?.certificatesPublishedCount || 0} published`,
                actionLabel: "Manage Certs",
                href: "/admin/certificates",
              },
              {
                title: "6. Communication",
                icon: <FiMail />,
                desc: "Email operations ready",
                actionLabel: "Email Center",
                href: "/admin/emails",
              },
            ].map((stage, idx) => (
              <div
                key={idx}
                className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-[124px] hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-slate-500 text-xs">{stage.icon}</span>
                    <h3 className="text-xs font-extrabold text-slate-800 truncate">{stage.title}</h3>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">{stage.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={stage.href}
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-800 hover:text-cyan-600 transition"
                  >
                    <span>{stage.actionLabel}</span>
                    <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: SESSION OPERATIONS & CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
                Live Attendance & Session Control
              </h2>

              {/* Current Active Session Widget */}
              {overview?.currentSessionId ? (
                <div className="bg-slate-900 text-white rounded-2xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500 text-[10px] font-bold text-slate-950 uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      ACTIVE SESSION
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">
                      Day {overview.currentSessionDay}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight">{overview.currentSessionTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{overview.currentSessionTime}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 bg-slate-800/50 rounded-xl p-3 border border-slate-800 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Present</p>
                      <p className="text-sm font-extrabold text-emerald-400 mt-0.5">{overview.attendancePresentCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Absent</p>
                      <p className="text-sm font-extrabold text-rose-400 mt-0.5">{overview.attendanceAbsentCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Attendance</p>
                      <p className="text-sm font-extrabold text-cyan-400 mt-0.5">{overview.attendancePercentage}%</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => handleCloseSession(overview.currentSessionId!)}
                      disabled={actionLoading !== null}
                      className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer active-press"
                    >
                      <FiXCircle className="text-xs" />
                      <span>Close Session</span>
                    </button>
                    <button
                      onClick={() => handleEnableQr(overview.currentSessionId!)}
                      disabled={actionLoading !== null}
                      className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer active-press"
                    >
                      <FiCamera className="text-xs" />
                      <span>Enable QR</span>
                    </button>
                    <button
                      onClick={() => handleDisableQr(overview.currentSessionId!)}
                      disabled={actionLoading !== null}
                      className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition disabled:opacity-50 cursor-pointer active-press"
                      title="Deactivate QR scanner"
                    >
                      <FiXCircle />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 text-center space-y-4">
                  <div className="text-center py-2">
                    <FiCalendar className="mx-auto text-2xl text-slate-400 mb-1.5" />
                    <h3 className="text-xs font-extrabold text-slate-900">No Session Actively Running</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Select an upcoming session below to activate it.</p>
                  </div>

                  {upcomingSessionsList.length > 0 ? (
                    <div className="space-y-3">
                      <select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                      >
                        {upcomingSessionsList.map((s) => (
                          <option key={s.id} value={s.id}>
                            Day {s.dayNumber} - {s.title}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleActivateSession}
                        disabled={actionLoading !== null || !selectedSessionId}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer active-press shadow-xs"
                      >
                        <FiPlay className="text-xs" />
                        <span>Activate Selected Session</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 font-bold text-center">
                      No upcoming sessions found. Create a session in management first.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Session Preview */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                UPCOMING NEXT
              </span>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">
                    {overview?.upcomingSessionTitle || "No upcoming session scheduled"}
                  </h4>
                  {overview?.upcomingSessionDay && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Day {overview.upcomingSessionDay} · {overview.upcomingSessionTime || "Time not set"}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/sessions"
                  className="text-xs font-bold text-cyan-700 hover:underline shrink-0"
                >
                  Manage Sessions
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION 4: CERTIFICATE OPERATIONS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
                Certificate Dispatch & Operations
              </h2>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                Execute student event completion credentials. Certificates can be batch-generated for students meeting the 75% attendance threshold, then published to make them downloadable.
              </p>

              <div className="grid grid-cols-3 gap-2 border border-slate-200 rounded-2xl p-4.5 text-center bg-slate-50/50 mb-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Eligible</span>
                  <span className="block text-lg font-extrabold text-slate-900 mt-1">{overview?.certificatesEligibleCount || 0}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Generated</span>
                  <span className="block text-lg font-extrabold text-slate-900 mt-1">{overview?.certificatesGeneratedCount || 0}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Available</span>
                  <span className="block text-lg font-extrabold text-cyan-700 mt-1">{overview?.certificatesPublishedCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleGenerateCertificates}
                disabled={actionLoading !== null || (overview?.certificatesEligibleCount || 0) === 0}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer active-press shadow-2xs"
              >
                {actionLoading === "generate-certs" ? "Generating..." : "Generate Certificates"}
              </button>
              <button
                onClick={handlePublishCertificates}
                disabled={actionLoading !== null || (overview?.certificatesGeneratedCount || 0) === 0}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer active-press shadow-xs"
              >
                {actionLoading === "publish-certs" ? "Publishing..." : "Publish Certificates"}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: EMAIL OPERATIONS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
            Email Operations Control
          </h2>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
            Select a verified email template and trigger batch dispatch to student groups. Template content is loaded from the Email Template module.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Template
              </label>
              {emailTemplates.length > 0 ? (
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-xs text-slate-950 focus:outline-none focus:border-cyan-600"
                >
                  {emailTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.templateName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-bold">
                  No templates. Configure in Email Management.
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recipient Group
              </label>
              <select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-xs text-slate-950 focus:outline-none focus:border-cyan-600"
              >
                <option value="PAID_STUDENTS">Paid Students ({overview?.paidCount || 0})</option>
                <option value="ALL_STUDENTS">All Registered Students ({overview?.registeredCount || 0})</option>
                <option value="PENDING_PAYMENTS">Pending Payment Students ({overview?.pendingPaymentCount || 0})</option>
              </select>
            </div>

            <div>
              <button
                onClick={handleSendEmails}
                disabled={actionLoading !== null || !selectedTemplateId}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer active-press shadow-xs h-10"
              >
                <FiSend className="text-xs" />
                <span>Dispatch Campaign</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6: QUICK ACTIONS SHORTCUTS */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3.5">
            Operational Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/sessions"
              className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-[84px] shadow-2xs hover:border-cyan-500/50 hover:shadow-xs transition"
            >
              <FiCalendar className="text-slate-500 text-base" />
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Create Session</span>
            </Link>

            <Link
              href="/admin/certificates"
              className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-[84px] shadow-2xs hover:border-cyan-500/50 hover:shadow-xs transition"
            >
              <FiAward className="text-slate-500 text-base" />
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Configure Certs</span>
            </Link>

            <Link
              href="/admin/emails"
              className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-[84px] shadow-2xs hover:border-cyan-500/50 hover:shadow-xs transition"
            >
              <FiMail className="text-slate-500 text-base" />
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Send Event Email</span>
            </Link>

            <Link
              href="/admin/attendance"
              className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-[84px] shadow-2xs hover:border-cyan-500/50 hover:shadow-xs transition"
            >
              <FiCamera className="text-slate-500 text-base" />
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Manage Attendance</span>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
