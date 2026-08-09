"use client"

import React, { useState } from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useEmailTemplates } from "../hooks/useEmailTemplates"
import { PageHeader } from "@/components/ui/PageHeader"
import EmailTemplatesTab from "./EmailTemplatesTab"
import EmailOperationsTab from "./EmailOperationsTab"
import { FiLayout, FiSend } from "react-icons/fi"

export default function EmailManagement() {
  const { loading, templates, reload } = useEmailTemplates()
  const [activeTab, setActiveTab] = useState<"templates" | "operations">("templates")

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="EMAIL_SEND">
        <div className="space-y-5">
          {/* Header */}
          <PageHeader
            title="Email Management"
            subtitle="Modular email architecture: Reusable Email Templates and Campaign Operations"
          />

          {/* Module Navigation Tabs (2-Part Clean Architecture) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs max-w-sm">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "templates"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FiLayout className="text-xs" />
              <span>1. Email Templates</span>
              <span className="text-[10px] font-mono opacity-80">({templates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "operations"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FiSend className="text-xs" />
              <span>2. Email Operations</span>
            </button>
          </div>

          {/* 1. Reusable Email Templates Module */}
          {activeTab === "templates" && (
            <EmailTemplatesTab templates={templates} loading={loading} onReload={reload} />
          )}

          {/* 2. Email Operations & Campaign Dispatch Module */}
          {activeTab === "operations" && <EmailOperationsTab templates={templates} />}
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
