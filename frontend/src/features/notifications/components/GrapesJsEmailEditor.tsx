"use client"

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import grapesjs, { Editor } from "grapesjs"
import gjsPresetNewsletter from "grapesjs-preset-newsletter"
import "grapesjs/dist/css/grapes.min.css"
import { CBP_CUSTOM_BLOCKS, CBPContentBlock } from "../constants/cbpBlocks"
import { EMAIL_VARIABLES } from "../constants/emailVariables"
import { FiCode, FiUpload, FiX, FiCheckCircle } from "react-icons/fi"

export interface GrapesJsEmailEditorRef {
  exportHtml: () => Promise<{ designJson: string; htmlContent: string; variablesUsed: string[] }>
  loadDesign: (jsonOrHtml: string) => void
  insertMergeTag: (key: string) => void
  insertHtmlBlock: (html: string) => void
  openImportModal: () => void
}

interface GrapesJsEmailEditorProps {
  initialDesignJson?: string
  initialHtmlContent?: string
  mode?: "normal" | "advanced"
}

const DEFAULT_OPERATIONAL_EMAIL_HTML = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 20px; font-family: Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">CAPACITY BUILDING PROGRAM 7.0</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #38bdf8;">Malaviya National Institute of Technology Jaipur</p>
          </td>
        </tr>
        <!-- Content Body -->
        <tr>
          <td style="padding: 32px; color: #334155; font-size: 14px; line-height: 1.6;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Official Notification</h2>
            <p>Dear <strong>{{studentName}}</strong>,</p>
            <p>Your enrollment details for the upcoming session have been updated.</p>
            
            <!-- Pass Card -->
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #0284c7;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Session Information</p>
              <p style="margin: 6px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">{{sessionName}}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Date &amp; Venue: {{sessionDate}} | {{venue}}</p>
            </div>

            <!-- QR Code Section -->
            <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #fafafa; border: 1px dashed #cbd5e1; border-radius: 12px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Gate Security Entry Pass</p>
              <img src="{{qrCode}}" alt="Gate QR Pass" width="160" height="160" style="display: block; margin: 0 auto; border-radius: 8px;" />
              <p style="margin: 12px 0 0 0; font-size: 11px; font-mono: monospace; color: #64748b;">ID: {{studentId}}</p>
            </div>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">Please keep this email accessible on your smartphone for gate entry verification.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            <p style="margin: 0; font-weight: bold;">CBP 7.0 Organizing Committee &bull; MNIT Jaipur</p>
            <p style="margin: 4px 0 0 0;">Jawaharlal Nehru Marg, Jaipur, Rajasthan 302017</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`

const GrapesJsEmailEditor = forwardRef<GrapesJsEmailEditorRef, GrapesJsEmailEditorProps>(
  ({ initialDesignJson, initialHtmlContent, mode = "normal" }, ref) => {
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<Editor | null>(null)

    const [importModalOpen, setImportModalOpen] = useState(false)
    const [importedHtmlInput, setImportedHtmlInput] = useState("")

    useEffect(() => {
      if (!editorContainerRef.current) return

      const editor = grapesjs.init({
        container: editorContainerRef.current,
        height: "100%",
        width: "100%",
        fromElement: false,
        storageManager: false,
        plugins: [gjsPresetNewsletter],
        pluginsOpts: {
          [gjsPresetNewsletter as any]: {
            modalTitleImport: "Import Custom Operational HTML Template",
            cellStyle: {
              "font-family": "Arial, Helvetica, sans-serif",
              "font-size": "14px",
              color: "#334155",
            },
          },
        },
        deviceManager: {
          devices: [
            { id: "desktop", name: "Desktop (600px)", width: "600px", widthMedia: "600px" },
            { id: "mobile", name: "Mobile Pass (360px)", width: "360px", widthMedia: "360px" },
          ],
        },
      })

      editorRef.current = editor

      // Add Custom CBP Operational Content Blocks
      const bm = editor.BlockManager
      CBP_CUSTOM_BLOCKS.forEach((blk: CBPContentBlock) => {
        bm.add(`cbp-${blk.id}`, {
          label: blk.title,
          category: "CBP Operational Blocks",
          content: blk.htmlSnippet,
          attributes: { class: "fa fa-cubes" },
        })
      })

      // Add Dynamic Variables Blocks
      EMAIL_VARIABLES.forEach((v) => {
        bm.add(`var-${v.key}`, {
          label: `[+ ${v.label}]`,
          category: "Dynamic Variables",
          content: `<span>{{${v.key}}}</span>`,
          attributes: { class: "fa fa-tag" },
        })
      })

      // Load initial design content
      if (initialHtmlContent && initialHtmlContent.trim().length > 0) {
        editor.setComponents(initialHtmlContent)
      } else if (initialDesignJson && initialDesignJson.trim().length > 0) {
        try {
          const parsed = JSON.parse(initialDesignJson)
          editor.loadProjectData(parsed)
        } catch {
          editor.setComponents(DEFAULT_OPERATIONAL_EMAIL_HTML)
        }
      } else {
        editor.setComponents(DEFAULT_OPERATIONAL_EMAIL_HTML)
      }

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy()
          editorRef.current = null
        }
      }
    }, [])

    useImperativeHandle(ref, () => ({
      exportHtml: async () => {
        if (!editorRef.current) {
          return { designJson: "", htmlContent: DEFAULT_OPERATIONAL_EMAIL_HTML, variablesUsed: [] }
        }

        const editor = editorRef.current
        const htmlContent = editor.runCommand("gjs-get-inlined-html") || editor.getHtml()
        const projectData = editor.getProjectData()
        const designJson = JSON.stringify(projectData)

        // Parse variables used in the template
        const variablesUsed: string[] = []
        EMAIL_VARIABLES.forEach((v) => {
          if (htmlContent.includes(`{{${v.key}}}`) || htmlContent.includes(`{{ ${v.key} }}`)) {
            variablesUsed.push(v.key)
          }
        })

        return { designJson, htmlContent, variablesUsed }
      },

      loadDesign: (jsonOrHtml: string) => {
        if (!editorRef.current || !jsonOrHtml) return
        const editor = editorRef.current
        try {
          const parsed = JSON.parse(jsonOrHtml)
          editor.loadProjectData(parsed)
        } catch {
          editor.setComponents(jsonOrHtml)
        }
      },

      insertMergeTag: (key: string) => {
        if (!editorRef.current) return
        const editor = editorRef.current
        const selected = editor.getSelected()
        if (selected) {
          selected.append(`<span>{{${key}}}</span>`)
        } else {
          editor.addComponents(`<span>{{${key}}}</span>`)
        }
      },

      insertHtmlBlock: (html: string) => {
        if (!editorRef.current) return
        const editor = editorRef.current
        editor.addComponents(html)
      },

      openImportModal: () => {
        setImportedHtmlInput("")
        setImportModalOpen(true)
      },
    }))

    const handlePerformImport = () => {
      if (editorRef.current && importedHtmlInput.trim()) {
        editorRef.current.setComponents(importedHtmlInput.trim())
        setImportModalOpen(false)
      }
    }

    return (
      <div className="w-full h-full min-h-[500px] relative bg-slate-900 overflow-hidden flex flex-col">
        <style jsx global>{`
          .gjs-cv-canvas {
            background-color: #0f172a !important;
          }
          .gjs-block {
            background-color: #1e293b !important;
            color: #f8fafc !important;
            border-radius: 8px !important;
            border: 1px solid #334155 !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            padding: 8px !important;
          }
          .gjs-block:hover {
            border-color: #38bdf8 !important;
            color: #38bdf8 !important;
          }
          .gjs-pn-views-container, .gjs-pn-commands, .gjs-pn-options {
            background-color: #0f172a !important;
            border-color: #1e293b !important;
          }
        `}</style>

        <div ref={editorContainerRef} className="w-full h-full flex-1" />

        {/* HTML IMPORT MODAL (Advanced Mode) */}
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden text-slate-100">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                  <FiUpload className="text-cyan-400 text-lg" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Import Custom Operational HTML Template
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-400">
                  Paste raw HTML/CSS code below. GrapesJS will parse and render your template into editable design components:
                </p>

                <textarea
                  value={importedHtmlInput}
                  onChange={(e) => setImportedHtmlInput(e.target.value)}
                  placeholder="<table width='100%'>...</table>"
                  rows={12}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
                />

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-[11px] text-cyan-300 flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-400 shrink-0" />
                  <span>Variables like {"{{studentName}}"} and {"{{qrCode}}"} are preserved automatically during import.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800 bg-slate-950">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePerformImport}
                  disabled={!importedHtmlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <FiUpload /> Import HTML Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

GrapesJsEmailEditor.displayName = "GrapesJsEmailEditor"
export default GrapesJsEmailEditor
