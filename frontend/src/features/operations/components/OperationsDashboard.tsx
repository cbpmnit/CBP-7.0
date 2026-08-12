"use client"

import { useState, useEffect, useCallback } from "react"
import { operationsApi, AdminOperationsOverviewDto } from "@/features/operations/services/operationsApi"
import { OperationsTabs } from "@/features/operations/components/OperationsTabs"
import { QrOperationsPanel } from "@/features/operations/components/qr/QrOperationsPanel"
import { EmailOperationsPanel } from "@/features/operations/components/email/EmailOperationsPanel"
import { PageHeader } from "@/components/ui/PageHeader"
import {
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi"

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState<"qr" | "email">("qr")
  const [overview, setOverview] = useState<AdminOperationsOverviewDto | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  
  const [statusMessage, setStatusMessage] = useState<{
    text: string
    type: "success" | "error" | "info"
  } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [overviewRes, sessionsRes, templatesRes] = await Promise.allSettled([
        operationsApi.getOverview(),
        operationsApi.getAllSessions(),
        operationsApi.getEmailTemplates(),
      ])

      if (overviewRes.status === "fulfilled") {
        setOverview(overviewRes.value)
      }
      
      if (sessionsRes.status === "fulfilled") {
        const sList = sessionsRes.value || []
        setSessions(sList)
        if (!selectedSessionId) {
          const upcoming = sList.find((s: any) => s.status === "UPCOMING" || s.status === "ACTIVE")
          if (upcoming) {
            setSelectedSessionId(upcoming.id)
          } else if (sList.length > 0) {
            setSelectedSessionId(sList[0].id)
          }
        }
      }

      if (templatesRes.status === "fulfilled") {
        const templates = templatesRes.value || []
        setEmailTemplates(templates)
      }

      if (overviewRes.status === "rejected" && sessionsRes.status === "rejected") {
        setStatusMessage({
          text: "Unable to reach the backend server (http://localhost:8080). Please ensure Spring Boot is running.",
          type: "error",
        })
      }
    } catch (err: any) {
      console.error("Failed to load operations data", err)
      setStatusMessage({
        text: "Error loading operational data. Please ensure the backend server is running.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedSessionId])

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Operations Command Center"
        subtitle="Manage student QR passes, personalized email communications, and administrative workflows"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin text-xs" : "text-xs"} />
            <span>Refresh Data</span>
          </button>
        }
      />

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : statusMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-cyan-50 border-cyan-200 text-cyan-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
            ) : statusMessage.type === "error" ? (
              <FiAlertCircle className="text-rose-600 shrink-0 text-base" />
            ) : (
              <FiActivity className="text-cyan-600 shrink-0 text-base" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {overview?.registeredCount ?? 0}
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Paid Enrolled</span>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {overview?.paidCount ?? 0}
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Present Count</span>
          <p className="text-2xl font-extrabold text-cyan-800 font-mono mt-1">
            {overview?.attendancePresentCount ?? 0}
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Active Session</span>
          <p className="text-sm font-extrabold text-slate-900 truncate mt-1">
            {overview?.currentSessionTitle || "None"}
          </p>
        </div>
      </div>

      {/* TAB NAVIGATION: QR PASS OPERATIONS vs EMAIL OPERATIONS */}
      <OperationsTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* TAB 1: QR PASS OPERATIONS */}
      {activeTab === "qr" && (
        <QrOperationsPanel
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionChange={(id) => setSelectedSessionId(id)}
          onRefreshNeeded={loadData}
        />
      )}

      {/* TAB 2: EMAIL OPERATIONS */}
      {activeTab === "email" && (
        <EmailOperationsPanel
          emailTemplates={emailTemplates}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionChange={(id) => setSelectedSessionId(id)}
        />
      )}
    </div>
  )
}
