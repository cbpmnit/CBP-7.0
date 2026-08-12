"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useEmailTemplates } from "../hooks/useEmailTemplates"
import { PageHeader } from "@/components/ui/PageHeader"
import EmailTemplatesTab from "./EmailTemplatesTab"
import EmailOperationsTab from "./EmailOperationsTab"
import EmailDeliveryLogsTab from "./EmailDeliveryLogsTab"
import EmailBuilderModal from "./EmailBuilderModal"
import { emailTemplateApi } from "../services/notificationApi"
import { NotificationTemplateResponse } from "../types"
import {
  FiLayout,
  FiSend,
  FiList,
  FiPlus,
  FiShield,
  FiLock,
  FiArrowLeft,
} from "react-icons/fi"

export default function EmailManagement() {
  const router = useRouter()
  const { role, permissions } = useAppSelector((state) => state.auth)

  const normalizedRole = (role || "").toUpperCase().replace("ROLE_", "")
  const isAdmin =
    normalizedRole === "ADMIN" ||
    (permissions || []).includes("EMAIL_SEND") ||
    (permissions || []).includes("EMAIL_MANAGE")

  const { loading, templates, reload } = useEmailTemplates()
  const [activeTab, setActiveTab] = useState<"templates" | "operations" | "logs">("templates")

  // Create / Edit Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateResponse | null>(null)

  const handleOpenCreate = (initialEventType?: string) => {
    setEditingTemplate(
      initialEventType
        ? ({
            eventType: initialEventType as any,
            name: `${initialEventType} Template`,
          } as any)
        : null
    )
    setBuilderOpen(true)
  }

  const handleOpenEdit = (t: NotificationTemplateResponse) => {
    setEditingTemplate(t)
    setBuilderOpen(true)
  }

  const handleSaveTemplate = async (data: any) => {
    if (editingTemplate) {
      await emailTemplateApi.updateTemplate(editingTemplate.id, data)
    } else {
      await emailTemplateApi.createTemplate(data)
    }
    await reload()
  }

  // Requirement 8: Unauthorized Access Restricted Fallback
  if (!isAdmin) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            <FiLock />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Access Restricted</h2>
            <p className="text-xs text-slate-500">
              You do not have permission to manage email templates.
            </p>
          </div>
          <button
            onClick={() => router.replace("/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-2 cursor-pointer"
          >
            <FiArrowLeft /> Go to Dashboard
          </button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="EMAIL_SEND">
        <div className="space-y-5">
          {/* Requirement 1: Header Improvement with Primary "+ Create Template" Action */}
          <PageHeader
            title="Email Management"
            subtitle="Manage automated email templates, variables, and communication workflows."
            actions={
              <button
                type="button"
                onClick={() => handleOpenCreate()}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Create Template</span>
              </button>
            }
          />

          {/* Requirement 2: Top Section Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs max-w-md">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "templates"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FiLayout className="text-xs" />
              <span>1. Templates</span>
              <span className="text-[10px] font-mono opacity-80">({templates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "operations"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FiSend className="text-xs" />
              <span>2. Email Operations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "logs"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FiList className="text-xs" />
              <span>3. Delivery Logs</span>
            </button>
          </div>

          {/* Tab 1: Reusable Email Templates List & Filters */}
          {activeTab === "templates" && (
            <EmailTemplatesTab
              templates={templates}
              loading={loading}
              onReload={reload}
              onOpenCreate={handleOpenCreate}
              onOpenEdit={handleOpenEdit}
            />
          )}

          {/* Tab 2: Email Operations & Campaign Dispatch */}
          {activeTab === "operations" && <EmailOperationsTab templates={templates} />}

          {/* Tab 3: Delivery Logs */}
          {activeTab === "logs" && <EmailDeliveryLogsTab />}

          {/* Create & Edit Email Template Modal */}
          {builderOpen && (
            <EmailBuilderModal
              isOpen={builderOpen}
              onClose={() => {
                setBuilderOpen(false)
                setEditingTemplate(null)
              }}
              initialTemplate={editingTemplate}
              onSave={handleSaveTemplate}
            />
          )}
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
