"use client"

import React, { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { EMAIL_VARIABLES } from "../constants/emailVariables"
import {
  FiMonitor,
  FiSmartphone,
  FiX,
  FiMail,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi"

interface Props {
  isOpen: boolean
  onClose: () => void
  templateName?: string
  subject?: string
  htmlContent?: string
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  templateName = "Template Preview",
  subject = "Your CBP 7.0 Gate Pass for {{sessionName}}",
  htmlContent = "",
}: Props) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Substitute variables with realistic sample values
  const substitutedHtml = useMemo(() => {
    let content = htmlContent && htmlContent.trim().length > 0 ? htmlContent : `
      <div style="padding: 24px; font-family: sans-serif; text-align: center;">
        <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 8px;">CBP 7.0 Operational Template</h3>
        <p style="color: #64748b; font-size: 12px;">Template preview content is verified.</p>
      </div>
    `

    EMAIL_VARIABLES.forEach((v) => {
      const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, "gi")
      if (v.key === "qrCode") {
        const sampleQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CBP-2026-GATE-PASS-2024UCH1198-VERIFIED`
        content = content.replace(regex, sampleQr)
      } else {
        content = content.replace(regex, v.exampleValue)
      }
    })

    return content
  }, [htmlContent])

  const substitutedSubject = useMemo(() => {
    let sub = subject || "Notification"
    EMAIL_VARIABLES.forEach((v) => {
      const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, "gi")
      sub = sub.replace(regex, v.exampleValue)
    })
    return sub
  }, [subject])

  if (!isOpen || !mounted) return null

  const modalNode = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-sm shadow-2xs">
              <FiMail />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                {templateName} &mdash; Email Preview
              </h2>
              <p className="text-[10px] text-slate-500">Realistic client preview with sample variable values</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher Buttons */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
                  deviceMode === "desktop" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiMonitor className="text-xs" /> Desktop Preview
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
                  deviceMode === "mobile" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiSmartphone className="text-xs" /> Mobile Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Email Header Info */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 space-y-1.5 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] w-14">From:</span>
            <span className="font-semibold text-slate-800">CBP 7.0 Admin &lt;no-reply@cbp.mnit.ac.in&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] w-14">To:</span>
            <span className="font-semibold text-slate-800">Parv Agrawal &lt;parvagrawal@mnit.ac.in&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] w-14">Subject:</span>
            <span className="font-extrabold text-cyan-900">{substitutedSubject}</span>
          </div>
        </div>

        {/* Preview Frame Body Container */}
        <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
          <div
            className={`transition-all duration-300 bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden ${
              deviceMode === "mobile" ? "w-[360px] min-h-[580px] my-2" : "w-full max-w-2xl min-h-[480px]"
            }`}
          >
            <div
              className="p-4 sm:p-6"
              dangerouslySetInnerHTML={{ __html: substitutedHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalNode, document.body)
}
