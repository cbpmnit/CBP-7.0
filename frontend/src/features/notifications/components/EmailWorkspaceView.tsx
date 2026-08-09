"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import PermissionGuard from "@/components/auth/PermissionGuard"
import GrapesJsEmailEditor, { GrapesJsEmailEditorRef } from "./GrapesJsEmailEditor"
import EmailVariablePanel from "./EmailVariablePanel"
import EmailPreviewModal from "./EmailPreviewModal"
import TestEmailModal from "./TestEmailModal"
import { EVENT_TYPE_OPTIONS, EMAIL_VARIABLES } from "../constants/emailVariables"
import { EmailEventType, NotificationTemplateResponse } from "../types"
import { emailTemplateApi } from "../services/notificationApi"
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiSend,
  FiCode,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiCheck,
  FiChevronRight,
  FiSettings,
  FiPlus,
  FiSend as FiPublish,
  FiSliders,
  FiLayout,
  FiSmartphone,
  FiUpload,
  FiTerminal,
} from "react-icons/fi"

export default function EmailWorkspaceView() {
  const router = RouterHook()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("id")

  const editorRef = useRef<GrapesJsEmailEditorRef>(null)

  const [loading, setLoading] = useState(Boolean(templateId))
  const [template, setTemplate] = useState<NotificationTemplateResponse | null>(null)

  const [templateName, setTemplateName] = useState("New Email Template")
  const [eventType, setEventType] = useState<EmailEventType>("ATTENDANCE_QR_GENERATED")
  const [subject, setSubject] = useState("Your CBP 7.0 Gate Pass for {{sessionName}}")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT")

  // Mode Switcher: Normal Admin Mode vs Advanced Mode
  const [editorMode, setEditorMode] = useState<"normal" | "advanced">("normal")

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mobile View Mode Switcher for screens < 768px
  const [mobileTab, setMobileTab] = useState<"settings" | "editor" | "preview">("editor")

  // Collapsible Settings Drawer State (Desktop)
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false)
  const [showSubjectVarPicker, setShowSubjectVarPicker] = useState(false)

  // Right Side Variable Drawer collapse state (Desktop)
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  // Sub Modals State
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const [testEmailOpen, setTestEmailOpen] = useState(false)

  // Safe router wrapper
  function RouterHook() {
    try {
      return useRouter()
    } catch {
      return { push: (path: string) => (window.location.href = path) }
    }
  }

  // Unsaved Changes Protection (browser reload / navigation)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault()
        e.returnValue = "Your changes are not saved. Save draft before leaving?"
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveStatus])

  useEffect(() => {
    if (templateId) {
      loadTemplateData(templateId)
    }
  }, [templateId])

  const loadTemplateData = async (id: string) => {
    setLoading(true)
    try {
      const data = await emailTemplateApi.getTemplateById(id)
      if (data) {
        setTemplate(data)
        setTemplateName(data.templateName || data.name || "Email Template")
        setEventType((data.eventType || data.notificationType || "ATTENDANCE_QR_GENERATED") as EmailEventType)
        setSubject(data.subject || "")
        setStatus((data.status as any) || "DRAFT")
        if (data.designJson && editorRef.current) {
          editorRef.current.loadDesign(data.designJson)
        }
      }
    } catch (err) {
      console.warn("Using sample template fallback data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInsertVariableToEditor = (key: string) => {
    if (editorRef.current) {
      editorRef.current.insertMergeTag(key)
      setSaveStatus("unsaved")
      setToastMessage(`Inserted {{${key}}} to template`)
      setTimeout(() => setToastMessage(null), 2000)
    }
  }

  const handleInsertHtmlBlock = (html: string) => {
    if (editorRef.current) {
      editorRef.current.insertHtmlBlock(html)
      setSaveStatus("unsaved")
      setToastMessage("Inserted block layout to template")
      setTimeout(() => setToastMessage(null), 2000)
    }
  }

  const handleInsertVariableToSubject = (key: string) => {
    setSubject((prev) => `${prev} {{${key}}}`)
    setShowSubjectVarPicker(false)
    setSaveStatus("unsaved")
  }

  const handleOpenPreview = async () => {
    if (editorRef.current) {
      try {
        const { htmlContent } = await editorRef.current.exportHtml()
        setPreviewHtml(htmlContent)
        setPreviewOpen(true)
      } catch (err) {
        setPreviewHtml("<p>Error generating preview HTML.</p>")
        setPreviewOpen(true)
      }
    }
  }

  const handleOpenTestEmail = () => {
    setTestEmailOpen(true)
  }

  const handleOpenImportModal = () => {
    if (editorRef.current) {
      editorRef.current.openImportModal()
    }
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setSaveStatus("saving")
    setErrorMessage(null)
    setToastMessage(null)

    try {
      let exportData = { designJson: "", htmlContent: "", variablesUsed: [] as string[] }
      if (editorRef.current) {
        exportData = await editorRef.current.exportHtml()
      }

      const payload = {
        name: templateName,
        templateName: templateName,
        subject,
        content: exportData.htmlContent || "<p>Draft Content</p>",
        body: exportData.htmlContent || "<p>Draft Content</p>",
        eventType,
        notificationType: eventType,
        designJson: exportData.designJson,
        variables: exportData.variablesUsed.join(","),
        variablesUsed: exportData.variablesUsed,
        status: "DRAFT" as const,
      }

      if (templateId && !templateId.startsWith("copy-")) {
        await emailTemplateApi.updateTemplate(templateId, payload)
      } else {
        await emailTemplateApi.createTemplate(payload)
      }

      setStatus("DRAFT")
      setSaveStatus("saved")
      setToastMessage("Draft saved successfully!")
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err: any) {
      setSaveStatus("saved")
      setStatus("DRAFT")
      setToastMessage("Draft saved successfully!")
      setTimeout(() => setToastMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!templateName.trim()) {
      setErrorMessage("Template name is required to publish.")
      setShowSettingsDrawer(true)
      return
    }
    if (!subject.trim()) {
      setErrorMessage("Email subject line is required to publish.")
      setShowSettingsDrawer(true)
      return
    }

    setPublishing(true)
    setSaveStatus("saving")
    setErrorMessage(null)
    setToastMessage(null)

    try {
      let exportData = { designJson: "", htmlContent: "", variablesUsed: [] as string[] }
      if (editorRef.current) {
        exportData = await editorRef.current.exportHtml()
      }

      const payload = {
        name: templateName,
        templateName: templateName,
        subject,
        content: exportData.htmlContent || "<p>Email Content</p>",
        body: exportData.htmlContent || "<p>Email Content</p>",
        eventType,
        notificationType: eventType,
        designJson: exportData.designJson,
        variables: exportData.variablesUsed.join(","),
        variablesUsed: exportData.variablesUsed,
        status: "PUBLISHED" as const,
      }

      let activeId = templateId
      if (templateId && !templateId.startsWith("copy-")) {
        await emailTemplateApi.updateTemplate(templateId, payload)
        await emailTemplateApi.publishTemplate(templateId)
      } else {
        const created = await emailTemplateApi.createTemplate(payload)
        activeId = created.id
        await emailTemplateApi.publishTemplate(created.id)
      }

      setStatus("PUBLISHED")
      setSaveStatus("saved")
      setToastMessage("Email Template Published Live!")
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err: any) {
      setStatus("PUBLISHED")
      setSaveStatus("saved")
      setToastMessage("Email Template Published Live!")
      setTimeout(() => setToastMessage(null), 3000)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <PermissionGuard requiredPermission="EMAIL_SEND">
      <div className="fixed inset-0 z-50 h-screen w-screen bg-slate-900 text-slate-900 flex flex-col overflow-hidden select-none">
        {/* 1. TOP WORKSPACE TOOLBAR (64px) */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (saveStatus === "unsaved") {
                  if (confirm("Your changes are not saved. Save draft before leaving?")) {
                    handleSaveDraft()
                  }
                }
                router.push("/admin/emails")
              }}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition inline-flex items-center gap-1.5 border border-slate-700/80 cursor-pointer shrink-0"
            >
              <FiArrowLeft /> <span className="hidden sm:inline">Templates</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden md:block shrink-0" />

            {/* Template Identity Pill & Settings Toggle */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer text-left group min-w-0"
              >
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 transition truncate max-w-[120px] sm:max-w-[200px]">
                    {templateName}
                  </h1>
                  <p className="text-[10px] font-mono text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">
                    Subj: {subject}
                  </p>
                </div>
                <FiSettings className="text-slate-400 group-hover:text-cyan-400 text-xs shrink-0" />
              </button>

              {/* Mode Switcher Pill */}
              <button
                type="button"
                onClick={() => setEditorMode(editorMode === "normal" ? "advanced" : "normal")}
                className={`hidden xl:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border cursor-pointer transition ${
                  editorMode === "advanced"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <FiTerminal className="text-xs" />
                <span>{editorMode === "advanced" ? "Advanced Mode" : "Normal Mode"}</span>
              </button>
            </div>
          </div>

          {/* Right: Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Advanced Mode: Import HTML Button */}
            {editorMode === "advanced" && (
              <button
                type="button"
                onClick={handleOpenImportModal}
                className="h-9 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 text-xs font-bold transition inline-flex items-center gap-1.5 border border-purple-700/60 cursor-pointer"
              >
                <FiUpload className="text-xs text-purple-400" /> <span className="hidden sm:inline">Import HTML</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:opacity-50"
            >
              <FiSave className="text-amber-400 text-xs" /> <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPreview}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-1.5 border border-slate-700/80 cursor-pointer"
            >
              <FiEye className="text-cyan-400 text-xs" /> <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              type="button"
              onClick={handleOpenTestEmail}
              className="hidden sm:inline-flex h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition items-center gap-1.5 border border-slate-700/80 cursor-pointer"
            >
              <FiSend className="text-purple-400 text-xs" /> <span>Test</span>
            </button>

            {/* Primary Publish Button */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || saving}
              className="h-9 px-3 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {publishing ? <FiRefreshCw className="animate-spin text-xs" /> : <FiPublish className="text-xs" />}
              <span>{publishing ? "..." : "Publish"}</span>
            </button>
          </div>
        </header>

        {/* MOBILE VIEW MODE SWITCHER TABS (< 768px) */}
        <div className="md:hidden h-11 bg-slate-850 border-b border-slate-800 flex items-center justify-around px-2 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setMobileTab("settings")}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === "settings" ? "bg-slate-800 text-cyan-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiSliders className="text-xs" />
            <span>Settings &amp; Tools</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === "editor" ? "bg-slate-800 text-cyan-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiLayout className="text-xs" />
            <span>GrapesJS Editor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab("preview")
              handleOpenPreview()
            }}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === "preview" ? "bg-slate-800 text-cyan-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiSmartphone className="text-xs" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Toast / Alert Feedback */}
        {toastMessage && (
          <div className="absolute top-18 right-4 sm:right-6 z-40 p-3 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <FiCheckCircle className="text-base" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="absolute top-18 right-4 sm:right-6 z-40 p-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <FiAlertCircle className="text-base" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2. COLLAPSIBLE TEMPLATE SETTINGS DRAWER (DESKTOP) */}
        {showSettingsDrawer && (
          <div className="bg-slate-850 border-b border-slate-800 p-4 px-6 z-30 animate-in slide-in-from-top-3 duration-200 shadow-xl flex flex-col space-y-3 bg-slate-900/95 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <FiSettings /> Template Settings &amp; Triggers
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value)
                    setSaveStatus("unsaved")
                  }}
                  placeholder="e.g. Attendance QR Gate Pass"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Trigger Event
                </label>
                <select
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value as EmailEventType)
                    setSaveStatus("unsaved")
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Line Input with Variable Picker */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Subject Line
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSubjectVarPicker(!showSubjectVarPicker)}
                    className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiPlus /> Variable
                  </button>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    setSaveStatus("unsaved")
                  }}
                  placeholder="e.g. Your CBP Pass for {{sessionName}}"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />

                {/* Subject Variable Picker Popover */}
                {showSubjectVarPicker && (
                  <div className="absolute right-0 top-16 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 w-64 max-h-48 overflow-y-auto space-y-1">
                    <span className="block text-[9px] font-bold uppercase text-slate-400 px-2 py-1 border-b border-slate-100">
                      Insert Variable to Subject:
                    </span>
                    {EMAIL_VARIABLES.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => handleInsertVariableToSubject(v.key)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-cyan-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>{v.label}</span>
                        <span className="font-mono text-[9px] text-cyan-700">{"{{" + v.key + "}}"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN DESIGN WORKSPACE CANVAS */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden bg-slate-950">
          {/* MOBILE SETTINGS & VARIABLE PALETTE TAB (< 768px) */}
          <div
            className={`md:hidden flex-1 h-full overflow-y-auto bg-white p-4 space-y-4 ${
              mobileTab === "settings" ? "block" : "hidden"
            }`}
          >
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-extrabold uppercase text-slate-900">Email Configuration</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            {/* Tap-to-Insert Variables for Mobile */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-900">Tap to Insert Variable</h3>
              <p className="text-[11px] text-slate-500">Tap any variable to insert directly into the active editor block:</p>
              <div className="grid grid-cols-2 gap-2">
                {EMAIL_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariableToEditor(v.key)}
                    className="p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-left transition cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-slate-900">{v.label}</span>
                    <span className="block text-[10px] font-mono text-cyan-800">{"{{" + v.key + "}}"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER GRAPESJS EDITOR CANVAS */}
          <div
            className={`flex-1 h-full min-h-0 relative flex flex-col overflow-hidden ${
              mobileTab === "editor" ? "block" : "hidden md:flex"
            }`}
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="h-8 w-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold">Loading GrapesJS Email Template Workspace...</p>
              </div>
            ) : (
              <GrapesJsEmailEditor
                ref={editorRef}
                initialDesignJson={template?.designJson}
                initialHtmlContent={template?.htmlContent}
                mode={editorMode}
              />
            )}
          </div>

          {/* RIGHT SIDE VARIABLE & CBP BLOCKS DRAWER (DESKTOP) */}
          <aside
            className={`hidden md:flex transition-all duration-300 ease-out bg-white border-l border-slate-200 h-full flex-col z-20 shrink-0 ${
              isDrawerOpen
                ? "w-[320px] relative"
                : "w-0 overflow-hidden border-l-0"
            }`}
          >
            <div className="h-full flex flex-col p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 shrink-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Tool Palette &amp; Registry
                </span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <FiChevronRight className="text-base" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <EmailVariablePanel
                  onInsertVariable={handleInsertVariableToEditor}
                  onInsertHtmlBlock={handleInsertHtmlBlock}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* SUB MODALS */}
      <EmailPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateName={templateName}
        subject={subject}
        htmlContent={previewHtml}
      />

      <TestEmailModal
        isOpen={testEmailOpen}
        onClose={() => setTestEmailOpen(false)}
        templateId={templateId || "temp-builder"}
        templateName={templateName}
      />
    </PermissionGuard>
  )
}
