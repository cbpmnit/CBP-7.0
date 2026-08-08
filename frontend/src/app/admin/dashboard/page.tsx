"use client"

import { useState } from "react"
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview"
import AdminAttendanceView from "@/components/attendance/AdminAttendanceView"
import AdminStudentDirectory from "@/components/admin/AdminStudentDirectory"
import AdminPaymentOverview from "@/components/admin/AdminPaymentOverview"
import AdminCertificateOverview from "@/components/admin/AdminCertificateOverview"
import EmailTemplateManager from "@/components/dashboard/EmailTemplateManager"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"

import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiMail,
  FiActivity,
} from "react-icons/fi"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "volunteers" | "sessions" | "attendance" | "payments" | "certificates" | "templates"
  >("overview")

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiGrid /> },
    { id: "students", label: "Student Management", icon: <FiUsers /> },
    { id: "volunteers", label: "Volunteer Management", icon: <FiUserCheck /> },
    { id: "sessions", label: "Session Management", icon: <FiCalendar /> },
    { id: "attendance", label: "Attendance Management", icon: <FiCamera /> },
    { id: "payments", label: "Payment Management", icon: <FiCreditCard /> },
    { id: "certificates", label: "Certificates", icon: <FiAward /> },
    { id: "templates", label: "Email Templates", icon: <FiMail /> },
  ]

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        {/* Sidebar Navigation */}
        <SidebarNavigation />

        {/* Main Admin Workspace */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Professional Institutional Header Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <FiActivity /> Admin Operations Portal
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  CBP 7.0 Admin Operations <span className="gradient-text-cyan">Dashboard</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Manage registrations, payments, attendance, certificates, and communication for the Soft Skills Development Program.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-center shrink-0">
                <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-left sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Program Host</p>
                  <p className="text-xs font-bold text-slate-900">Dept. of HSS & Placement Cell</p>
                </div>
              </div>
            </div>

            {/* Navigation Tab Bar (All 8 Modules) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {tabs.map((t) => {
                  const isActive = activeTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-600/30"
                          : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50/50"
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
              {activeTab === "students" && <AdminStudentDirectory />}
              {activeTab === "volunteers" && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Volunteer Operations & Onboarding</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Invite, assign, and manage gate scanner volunteer accounts.</p>
                    </div>
                    <a
                      href="/admin/volunteers"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Open Full Volunteer Panel →
                    </a>
                  </div>
                </div>
              )}
              {activeTab === "sessions" && <AdminAttendanceView />}
              {activeTab === "attendance" && <AdminAttendanceView />}
              {activeTab === "payments" && <AdminPaymentOverview />}
              {activeTab === "certificates" && <AdminCertificateOverview />}
              {activeTab === "templates" && <EmailTemplateManager />}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
