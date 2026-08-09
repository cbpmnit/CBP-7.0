"use client"

import React, { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { EMAIL_VARIABLES } from "../constants/emailVariables"
import {
  FiMonitor,
  FiTablet,
  FiSmartphone,
  FiX,
  FiEye,
  FiMail,
  FiShield,
} from "react-icons/fi"

interface Props {
  isOpen: boolean
  onClose: () => void
  templateName?: string
  subject?: string
  htmlContent?: string
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  templateName = "Template Preview",
  subject = "Your CBP 7.0 Gate Pass & Notification",
  htmlContent = "",
}: Props) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Lock body/page scrolling completely while preview overlay is active
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Prevent background scrolling
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  // 2. High-fidelity sample variable replacements
  const substitutedHtml = useMemo(() => {
    let content = htmlContent && htmlContent.trim().length > 0 ? htmlContent : `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px; font-family: Arial, sans-serif; text-align: center;">
        <tr>
          <td>
            <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0;">CBP 7.0 Operational Template</h3>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Template content is active and verified.</p>
          </td>
        </tr>
      </table>
    `

    EMAIL_VARIABLES.forEach((v) => {
      const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, "gi")
      if (v.key === "qrCode") {
        const sampleQr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=CBP-2026-GATE-PASS-2024UCH1198-VERIFIED`
        content = content.replace(regex, sampleQr)
      } else {
        content = content.replace(regex, v.exampleValue)
      }
    })

    // Safe fallback for broken or relative logo images
    content = content.replace(
      /src=["'](?!http|\/|data:)[^"']*logo[^"']*["']/gi,
      `src="/favicon/logo-landscape.webp"`
    )

    return content
  }, [htmlContent])

  const substitutedSubject = useMemo(() => {
    let sub = subject
    EMAIL_VARIABLES.forEach((v) => {
      const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, "gi")
      sub = sub.replace(regex, v.exampleValue)
    })
    return sub
  }, [subject])

  // 3. Isolated HTML Document String for iframe srcDoc
  const isolatedDocument = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }
    img {
      max-width: 100%;
      height: auto;
      display: inline-block;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    /* Smooth modern scrollbar inside iframe */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  </style>
</head>
<body style="margin: 0; padding: ${deviceMode === "mobile" ? "8px 4px" : "24px 12px"}; background-color: #f8fafc;">
  <center>
    <div style="max-width: ${deviceMode === "mobile" ? "100%" : "600px"}; width: 100%; margin: 0 auto; text-align: left;">
      ${substitutedHtml}
    </div>
  </center>
</body>
</html>`
  }, [substitutedHtml, templateName, deviceMode])

  if (!isOpen || !mounted) return null

  // Portal to document.body so the overlay sits above ALL parent components, headers, footers & layout wrappers
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 999999,
      }}
      className="bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in duration-200"
    >
      {/* 1. COMPACT PREVIEW TOOLBAR (52px) */}
      <header className="h-[52px] bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-md">
        {/* Left: Preview Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 shrink-0">
              Preview
            </span>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-xs font-semibold text-slate-400 truncate hidden sm:inline max-w-[200px] md:max-w-[320px]">
              {templateName}
            </span>
          </div>
        </div>

        {/* Center: Device Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setDeviceMode("desktop")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
              deviceMode === "desktop"
                ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiMonitor className="text-xs" /> <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode("tablet")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
              deviceMode === "tablet"
                ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiTablet className="text-xs" /> <span>Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiSmartphone className="text-xs" /> <span>Mobile</span>
          </button>
        </div>

        {/* Right: Close Preview Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Close Preview (Esc)"
          >
            <FiX className="text-sm" /> <span>Close</span>
          </button>
        </div>
      </header>

      {/* 2. ISOLATED WORKSPACE STAGE (Zero Outer Scrolling) */}
      <main className="flex-1 min-h-0 w-full overflow-hidden p-3 sm:p-5 flex items-center justify-center bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
        {deviceMode === "mobile" ? (
          /* MOBILE SMARTPHONE VIEWPORT (360px width, internal scrolling only) */
          <div
            style={{
              width: "360px",
              maxWidth: "calc(100vw - 24px)",
              height: "calc(100dvh - 52px - 32px)",
              maxHeight: "720px",
            }}
            className="relative bg-slate-900 rounded-[36px] p-2.5 shadow-2xl shadow-cyan-950/40 border-[5px] border-slate-800 flex flex-col shrink-0 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
          >
            {/* Speaker Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center">
              <div className="h-1 w-10 bg-slate-800 rounded-full" />
            </div>

            {/* Display Screen */}
            <div className="w-full h-full bg-white rounded-[26px] overflow-hidden flex flex-col pt-3">
              {/* Mobile Client Status Bar */}
              <div className="bg-slate-900 text-white px-4 py-1 flex items-center justify-between text-[10px] font-mono shrink-0">
                <span>9:41 AM</span>
                <span className="text-[9px] text-cyan-400 font-bold tracking-wider">CBP MAIL</span>
                <span>100% 🔋</span>
              </div>

              {/* Mobile Mail Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 shrink-0 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-[9px] shrink-0">
                  CP
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">CBP 7.0 Secretariat</p>
                  <p className="text-[10px] font-mono text-slate-500 truncate">{substitutedSubject}</p>
                </div>
              </div>

              {/* Inner Isolated iframe with internal vertical scrolling */}
              <iframe
                title="Mobile Email Preview"
                srcDoc={isolatedDocument}
                className="w-full flex-1 border-0 bg-[#f8fafc]"
                sandbox="allow-same-origin allow-scripts"
              />

              {/* Home Indicator */}
              <div className="bg-white py-1.5 flex items-center justify-center shrink-0 border-t border-slate-100">
                <div className="h-1 w-24 bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* DESKTOP / TABLET EMAIL CLIENT FRAME (600px width, internal scrolling only) */
          <div
            style={{
              width: deviceMode === "tablet" ? "min(600px, calc(100vw - 32px))" : "600px",
              maxWidth: "calc(100vw - 48px)",
              height: "calc(100dvh - 52px - 32px)",
              maxHeight: "800px",
            }}
            className="bg-white rounded-2xl shadow-2xl shadow-slate-950/80 border border-slate-700/80 overflow-hidden flex flex-col shrink-0 my-auto animate-in zoom-in-95 duration-150"
          >
            {/* Realistic Email Client Header Envelope */}
            <div className="bg-slate-900 text-slate-200 px-4 py-3 border-b border-slate-800 shrink-0 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <FiMail className="text-cyan-400 text-sm" />
                  <span>CBP Institutional Mail</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <FiShield className="text-[10px]" /> Verified Sender
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                    CP
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">CBP 7.0 Secretariat</span>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">&lt;cbp-notifications@mnit.ac.in&gt;</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      To: <span className="text-slate-200 font-medium">Parv Agrawal</span> &lt;student@mnit.ac.in&gt;
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">
                  09 Aug 2026, 14:30
                </span>
              </div>

              <div className="pt-1.5 border-t border-slate-800">
                <h1 className="text-xs font-bold text-white truncate">
                  Subject: {substitutedSubject}
                </h1>
              </div>
            </div>

            {/* Inner Isolated iframe with internal vertical scrolling */}
            <div className="w-full flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
              <iframe
                title="Desktop Email Preview"
                srcDoc={isolatedDocument}
                className="w-full flex-1 border-0 bg-[#f8fafc]"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}
      </main>
    </div>,
    document.body
  )
}

export default EmailPreviewModal
