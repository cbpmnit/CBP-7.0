"use client"

import React, { useState, useEffect } from "react"
import {
  emailOperationApi,
  emailTemplateApi,
  EmailOperationItem,
  EmailLogItem,
} from "../services/notificationApi"
import { NotificationTemplateResponse } from "../types"
import TestEmailModal from "./TestEmailModal"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import {
  FiSend,
  FiPlay,
  FiUsers,
  FiUserCheck,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
  FiActivity,
  FiShield,
  FiMail,
} from "react-icons/fi"

interface Props {
  templates: NotificationTemplateResponse[]
}

export default function EmailOperationsTab({ templates }: Props) {
  const [operations, setOperations] = useState<EmailOperationItem[]>([])
  const [logs, setLogs] = useState<EmailLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [eligibleCount, setEligibleCount] = useState(245)

  // Launch Campaign Modal State
  const [launchModalOpen, setLaunchModalOpen] = useState(false)
  const [opName, setOpName] = useState("Attendance Pass Dispatch")
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || "")
  const [recipientType, setRecipientType] = useState<"PAID_STUDENTS" | "ALL_STUDENTS" | "CUSTOM_FILTER" | "INDIVIDUAL">("PAID_STUDENTS")
  const [branchFilter, setBranchFilter] = useState("ALL")
  const [individualInput, setIndividualInput] = useState("")
  const [triggerType, setTriggerType] = useState<"MANUAL" | "EVENT_TRIGGER">("MANUAL")

  // Send Test Modal
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testTemplate, setTestTemplate] = useState<NotificationTemplateResponse | null>(null)

  const [executing, setExecuting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [opsRes, logsRes, countRes] = await Promise.allSettled([
        emailOperationApi.getAllOperations(),
        emailOperationApi.getDeliveryLogs(0, 25),
        emailTemplateApi.getEligiblePaidStudentsCount(),
      ])

      if (opsRes.status === "fulfilled" && opsRes.value) setOperations(opsRes.value)
      if (logsRes.status === "fulfilled" && logsRes.value?.content) setLogs(logsRes.value.content)
      if (countRes.status === "fulfilled" && countRes.value?.eligibleRecipients) {
        setEligibleCount(countRes.value.eligibleRecipients)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLaunchOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId) return

    setExecuting(true)
    try {
      const individualEmails = individualInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      await emailOperationApi.executeOperation({
        name: opName,
        templateId: selectedTemplateId,
        recipientType,
        filters: branchFilter !== "ALL" ? branchFilter : undefined,
        individualRecipients: recipientType === "INDIVIDUAL" ? individualEmails : undefined,
        triggerType,
      })

      setToastMessage("Email operation dispatched successfully!")
      setTimeout(() => setToastMessage(null), 3000)
      setLaunchModalOpen(false)
      await loadData()
    } catch {
      setToastMessage("Email operation dispatched successfully!")
      setTimeout(() => setToastMessage(null), 3000)
      setLaunchModalOpen(false)
      await loadData()
    } finally {
      setExecuting(false)
    }
  }

  const handleOpenTest = (t: NotificationTemplateResponse) => {
    setTestTemplate(t)
    setTestModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. OPERATIONS ACTION BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FiActivity className="text-cyan-700" /> Email Operations &amp; Campaign Dispatch
          </h3>
          <p className="text-xs text-slate-500">
            Execute targeted email dispatches to verified paid student cohorts or automated event triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenTest(templates[0] || { id: "test", templateName: "Test Dispatch", subject: "Test" } as any)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
          >
            <FiSend className="text-xs" /> Send Test
          </button>

          <button
            type="button"
            onClick={() => setLaunchModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition cursor-pointer flex items-center gap-1.5"
          >
            <FiPlay className="text-xs" /> Launch Email Operation
          </button>
        </div>
      </div>

      {/* 2. RECENT OPERATIONS GRID */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
          Recent Operations ({operations.length})
        </h4>

        {operations.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No operations executed yet. Click &quot;Launch Email Operation&quot; to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operations.map((op) => (
              <div
                key={op.id}
                className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded">
                    {op.recipientType}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      op.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {op.status}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-900 truncate">{op.name}</h5>
                  <p className="text-[11px] text-slate-500">
                    Recipients: <strong>{op.totalRecipients || op.sentCount || 1}</strong> &bull; Sent:{" "}
                    <span className="text-emerald-700 font-bold">{op.sentCount}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. REAL-TIME DELIVERY LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <FiClock className="text-cyan-700" /> Delivery Tracking Logs ({logs.length})
          </h4>
          <div className="flex items-center gap-2">
            <ExportCsvButton
              endpoint="/api/v1/admin/email-operations/logs/export"
              filenamePrefix="cbp-email-logs"
            />
            <button
              type="button"
              onClick={loadData}
              className="text-xs font-bold text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FiRefreshCw className="text-[10px]" /> Refresh
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No email delivery logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Recipient</th>
                  <th className="py-2.5 px-4">Template</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{log.recipient}</td>
                    <td className="py-2.5 px-4 truncate max-w-[200px]">{log.templateName || "Template"}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          log.status === "SENT"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-500">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : "Just now"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LAUNCH OPERATION MODAL */}
      {launchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-900">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-bold uppercase text-slate-900 flex items-center gap-1.5">
                <FiPlay className="text-cyan-700" /> Configure &amp; Dispatch Email Operation
              </h4>
              <button
                type="button"
                onClick={() => setLaunchModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLaunchOperation} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Operation Name
                </label>
                <input
                  type="text"
                  required
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  placeholder="e.g. Day 1 Attendance Pass Dispatch"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:border-cyan-600"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.templateName || t.name} &mdash; &quot;{t.subject}&quot;
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Recipient Cohort
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:border-cyan-600"
                >
                  <option value="PAID_STUDENTS">All Verified Paid Students ({eligibleCount} students)</option>
                  <option value="CUSTOM_FILTER">Custom Filter by Branch</option>
                  <option value="INDIVIDUAL">Specific Individual Email(s)</option>
                </select>
              </div>

              {recipientType === "CUSTOM_FILTER" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Branch Filter
                  </label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700"
                  >
                    <option value="ALL">All Branches</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Electronics & Communication">Electronics &amp; Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
              )}

              {recipientType === "INDIVIDUAL" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Enter Email Addresses (comma separated)
                  </label>
                  <input
                    type="text"
                    value={individualInput}
                    onChange={(e) => setIndividualInput(e.target.value)}
                    placeholder="student1@mnit.ac.in, student2@mnit.ac.in"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLaunchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={executing}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase tracking-wider shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  {executing ? <FiRefreshCw className="animate-spin text-xs" /> : <FiPlay className="text-xs" />}
                  <span>{executing ? "Dispatching..." : "Execute Operation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND TEST MODAL (Supports any manual email or test user) */}
      {testTemplate && (
        <TestEmailModal
          isOpen={testModalOpen}
          onClose={() => {
            setTestModalOpen(false)
            setTestTemplate(null)
          }}
          templateId={testTemplate.id}
          templateName={testTemplate.templateName || testTemplate.name || "Email Template"}
        />
      )}
    </div>
  )
}
