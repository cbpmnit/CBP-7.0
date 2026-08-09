"use client"

import React, { useState, useEffect } from "react"
import { emailBlockApi, EmailBlockItem } from "../services/notificationApi"
import {
  FiGrid,
  FiPlus,
  FiEye,
  FiCheck,
  FiX,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
  FiCheckCircle,
  FiCode,
  FiLayers,
} from "react-icons/fi"

const DEFAULT_BLOCKS: EmailBlockItem[] = [
  {
    id: "blk-1",
    name: "Student Information Block",
    category: "STUDENT",
    content: "Displays full student profile dossier, ID, and branch details",
    htmlSnippet: `<div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; margin: 16px 0; border: 1px solid #e2e8f0;"><p style="margin: 0; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Participant Profile</p><h4 style="margin: 6px 0 0 0; font-size: 16px; color: #0f172a; font-weight: bold;">{{studentName}}</h4><p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Student ID: <strong>{{studentId}}</strong> &bull; Email: {{email}}</p><p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Phone: {{phoneNumber}}</p></div>`,
    enabled: true,
  },
  {
    id: "blk-2",
    name: "Payment Information Block",
    category: "PAYMENT",
    content: "Receipt card showing fee amount, PhonePe reference, and verification timestamp",
    htmlSnippet: `<div style="background-color: #ecfdf5; border-radius: 8px; padding: 18px; margin: 16px 0; border: 1px solid #a7f3d0;"><p style="margin: 0; font-size: 11px; font-weight: bold; color: #065f46; text-transform: uppercase;">Payment Receipt</p><p style="margin: 6px 0 0 0; font-size: 15px; font-weight: bold; color: #064e3b;">Amount Paid: INR {{amount}}</p><p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">Transaction Ref: {{transactionId}} &bull; Status: {{paymentStatus}}</p><p style="margin: 2px 0 0 0; font-size: 11px; color: #059669;">Verified: {{paidAt}}</p></div>`,
    enabled: true,
  },
  {
    id: "blk-3",
    name: "Attendance QR Block",
    category: "ATTENDANCE",
    content: "Secure gate security pass block with encrypted barcode and venue info",
    htmlSnippet: `<div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #cbd5e1; text-align: center;"><p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #0f172a; text-transform: uppercase;">Gate Security Entry Pass</p><img src="{{qrCode}}" alt="Gate Entry QR" width="160" height="160" style="display: block; margin: 12px auto; border-radius: 8px;" /><p style="margin: 8px 0 0 0; font-size: 14px; font-weight: bold; color: #0f172a;">{{sessionName}}</p><p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Venue: {{venue}} &bull; Date: {{sessionDate}}</p></div>`,
    enabled: true,
  },
  {
    id: "blk-4",
    name: "Certificate Block",
    category: "CERTIFICATE",
    content: "Credential verification card with serial ID and direct PDF download link",
    htmlSnippet: `<div style="background-color: #faf5ff; border-radius: 8px; padding: 18px; margin: 16px 0; border: 1px solid #e9d5ff; text-align: center;"><p style="margin: 0; font-size: 11px; font-weight: bold; color: #6b21a8; text-transform: uppercase;">Official Verified Credential</p><p style="margin: 6px 0 0 0; font-size: 14px; font-weight: bold; color: #581c87;">Credential ID: {{certificateNumber}}</p><p style="margin: 4px 0 12px 0; font-size: 12px; color: #7e22ce;">Issued on: {{issueDate}}</p><a href="{{certificateUrl}}" style="display: inline-block; padding: 8px 20px; background-color: #7e22ce; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Download Certificate</a></div>`,
    enabled: true,
  },
]

export default function EmailBlocksTab() {
  const [blocks, setBlocks] = useState<EmailBlockItem[]>(DEFAULT_BLOCKS)
  const [loading, setLoading] = useState(false)
  const [previewSnippet, setPreviewSnippet] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [newBlockName, setNewBlockName] = useState("")
  const [newBlockCategory, setNewBlockCategory] = useState("STUDENT")
  const [newBlockContent, setNewBlockContent] = useState("")
  const [newBlockHtml, setNewBlockHtml] = useState("")

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    setLoading(true)
    try {
      const data = await emailBlockApi.getAllBlocks()
      if (data && data.length > 0) {
        setBlocks(data)
      } else {
        setBlocks(DEFAULT_BLOCKS)
      }
    } catch {
      setBlocks(DEFAULT_BLOCKS)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (id: string) => {
    try {
      await emailBlockApi.toggleBlock(id)
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
      )
      setToastMessage("Block status updated.")
      setTimeout(() => setToastMessage(null), 2500)
    } catch {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
      )
    }
  }

  const handleCreateCustomBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBlockName.trim() || !newBlockHtml.trim()) return

    try {
      const created = await emailBlockApi.createBlock({
        name: newBlockName.trim(),
        category: newBlockCategory,
        content: newBlockContent.trim(),
        htmlSnippet: newBlockHtml.trim(),
        enabled: true,
      })
      setBlocks((prev) => [...prev, created])
      setToastMessage("Custom block registered for GrapesJS editor!")
      setTimeout(() => setToastMessage(null), 3000)
      setCreateModalOpen(false)
      setNewBlockName("")
      setNewBlockContent("")
      setNewBlockHtml("")
    } catch {
      const fallbackBlock: EmailBlockItem = {
        id: `blk-${Date.now()}`,
        name: newBlockName.trim(),
        category: newBlockCategory as any,
        content: newBlockContent.trim(),
        htmlSnippet: newBlockHtml.trim(),
        enabled: true,
      }
      setBlocks((prev) => [...prev, fallbackBlock])
      setCreateModalOpen(false)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Are you sure you want to remove this block?")) return
    try {
      await emailBlockApi.deleteBlock(id)
      setBlocks((prev) => prev.filter((b) => b.id !== id))
    } catch {
      setBlocks((prev) => prev.filter((b) => b.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FiLayers className="text-cyan-700" /> GrapesJS Reusable Drag-and-Drop Blocks
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pre-built operational email blocks automatically loaded into the GrapesJS visual editor palette.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition cursor-pointer"
        >
          <FiPlus /> Create Custom Block
        </button>
      </div>

      {/* Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blocks.map((blk) => (
          <div
            key={blk.id}
            className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3.5 hover:border-slate-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                  {blk.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleBlock(blk.id)}
                  className={`inline-flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                    blk.enabled ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {blk.enabled ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
                  <span className="text-[10px] uppercase font-mono">{blk.enabled ? "Active" : "Disabled"}</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{blk.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{blk.content || "Reusable email component block"}</p>
              </div>

              {/* Code preview snippet snippet */}
              <div className="p-2 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[10px] overflow-hidden max-h-16 relative">
                <pre className="truncate">{blk.htmlSnippet}</pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewSnippet(blk.htmlSnippet)}
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
              >
                <FiEye className="text-xs" /> Preview Rendered Block
              </button>

              {blk.category === "CUSTOM" && (
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(blk.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                  title="Delete Custom Block"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Snippet Modal */}
      {previewSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-bold uppercase text-slate-900 flex items-center gap-1.5">
                <FiEye className="text-cyan-700" /> Block HTML Preview
              </h4>
              <button
                type="button"
                onClick={() => setPreviewSnippet(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-base" />
              </button>
            </div>
            <div className="p-6 bg-[#f8fafc] overflow-y-auto max-h-96">
              <div
                dangerouslySetInnerHTML={{
                  __html: previewSnippet
                    .replace(/\{\{studentName\}\}/g, "Parv Agrawal")
                    .replace(/\{\{studentId\}\}/g, "2024UCH1198")
                    .replace(/\{\{email\}\}/g, "student@mnit.ac.in")
                    .replace(/\{\{phoneNumber\}\}/g, "+91 98765 43210")
                    .replace(/\{\{amount\}\}/g, "500.00")
                    .replace(/\{\{transactionId\}\}/g, "TXN_CBP_98241")
                    .replace(/\{\{paidAt\}\}/g, "09 Aug 2026")
                    .replace(/\{\{paymentStatus\}\}/g, "SUCCESS")
                    .replace(/\{\{sessionName\}\}/g, "Day 1: Leadership & Skills")
                    .replace(/\{\{venue\}\}/g, "VLTC Auditorium, MNIT")
                    .replace(/\{\{sessionDate\}\}/g, "10 August 2026")
                    .replace(/\{\{qrCode\}\}/g, "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SAMPLE-PASS")
                    .replace(/\{\{certificateNumber\}\}/g, "CBP-2026-8841-MNIT")
                    .replace(/\{\{issueDate\}\}/g, "15 August 2026")
                    .replace(/\{\{certificateUrl\}\}/g, "#"),
                }}
              />
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewSnippet(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Block Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-bold uppercase text-slate-900 flex items-center gap-1.5">
                <FiPlus className="text-cyan-700" /> Create Custom Operational Block
              </h4>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomBlock} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Block Name
                </label>
                <input
                  type="text"
                  required
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  placeholder="e.g. Schedule Timing Matrix"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newBlockCategory}
                  onChange={(e) => setNewBlockCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:border-cyan-600"
                >
                  <option value="STUDENT">Student Details</option>
                  <option value="PAYMENT">Payment Receipt</option>
                  <option value="ATTENDANCE">Attendance &amp; Pass</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="CUSTOM">Custom Layout</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={newBlockContent}
                  onChange={(e) => setNewBlockContent(e.target.value)}
                  placeholder="e.g. Displays formatted session agenda matrix"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  HTML Snippet (with inline styles)
                </label>
                <textarea
                  rows={5}
                  required
                  value={newBlockHtml}
                  onChange={(e) => setNewBlockHtml(e.target.value)}
                  placeholder="<div style='padding: 16px; background: #f8fafc;'>...</div>"
                  className="w-full p-2.5 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-700 focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase tracking-wider shadow-2xs cursor-pointer"
                >
                  Register Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
