"use client"

import { useState, useEffect, useCallback } from "react"
import { operationsApi, AdminOperationsOverviewDto } from "@/features/operations/services/operationsApi"
import { OperationsTabs } from "@/features/operations/components/OperationsTabs"
import { QrOperationsPanel } from "@/features/operations/components/qr/QrOperationsPanel"
import { EmailOperationsPanel } from "@/features/operations/components/email/EmailOperationsPanel"
import { PageHeader } from "@/components/ui/PageHeader"
import { MetricCard } from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import {
  FiRefreshCw,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAward,
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
          text: "Unable to reach the backend server. Please ensure Spring Boot is running.",
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
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            icon={
              <FiRefreshCw className={loading ? "animate-spin text-xs" : "text-xs"} />
            }
          >
            Refresh Data
          </Button>
        }
      />

      {statusMessage && (
        <Alert
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <MetricCard
          title="Total Registered"
          value={overview?.registeredCount ?? 0}
          icon={<FiUsers className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title="Paid Students"
          value={overview?.paidCount ?? 0}
          icon={<FiCheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Sessions Scheduled"
          value={overview?.sessionsConfiguredCount ?? 0}
          icon={<FiClock className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Eligible Credentials"
          value={overview?.certificatesEligibleCount ?? 0}
          icon={<FiCheckCircle className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      <OperationsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "qr" && (
        <QrOperationsPanel
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionChange={setSelectedSessionId}
          onRefreshNeeded={loadData}
        />
      )}

      {activeTab === "email" && (
        <EmailOperationsPanel
          emailTemplates={emailTemplates}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionChange={setSelectedSessionId}
        />
      )}
    </div>
  )
}
