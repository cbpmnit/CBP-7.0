"use client"

import { useState } from "react"
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview"
import AdminAttendanceView from "@/components/attendance/AdminAttendanceView"
import AdminStudentDirectory from "@/components/admin/AdminStudentDirectory"
import AdminPaymentOverview from "@/components/admin/AdminPaymentOverview"
import AdminCertificateOverview from "@/components/admin/AdminCertificateOverview"
import EmailTemplateManager from "@/components/dashboard/EmailTemplateManager"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"

import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiCreditCard,
  FiAward,
  FiMail,
  FiShield,
} from "react-icons/fi"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "sessions" | "students" | "payments" | "certificates" | "templates"
  >("overview")

  const tabs = [
    { id: "overview", label: "Program Overview", icon: <FiGrid /> },
    { id: "sessions", label: "Session Management", icon: <FiCalendar /> },
    { id: "students", label: "Student Directory", icon: <FiUsers /> },
    { id: "payments", label: "Payment Overview", icon: <FiCreditCard /> },
    { id: "certificates", label: "Certificates", icon: <FiAward /> },
    { id: "templates", label: "Email Templates", icon: <FiMail /> },
  ]

  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
      {/* Sidebar Navigation */}
      <SidebarNavigation />

      {/* Main Admin Workspace */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-2xl shrink-0">
                <FiShield />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  Organizer Control Console
                </span>
                <h1 className="text-xl font-extrabold mt-1 text-white">CBP 7.0 Admin Operational Dashboard</h1>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
              MNIT CBP Operations
            </span>
          </div>

          {/* Navigation Tab Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {tabs.map((t) => {
                const isActive = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Tab Workspace View */}
          <div>
            {activeTab === "overview" && (
              <AdminDashboardOverview onNavigateTab={(tab) => setActiveTab(tab as any)} />
            )}
            {activeTab === "sessions" && <AdminAttendanceView />}
            {activeTab === "students" && <AdminStudentDirectory />}
            {activeTab === "payments" && <AdminPaymentOverview />}
            {activeTab === "certificates" && <AdminCertificateOverview />}
            {activeTab === "templates" && <EmailTemplateManager />}
          </div>
        </div>
      </main>
    </div>
  )
}
