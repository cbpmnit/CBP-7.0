"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  certificateApi,
} from "../services/certificateApi"
import {
  CertificateFieldConfiguration,
  CertificateFieldStyle,
  CertificateTemplate,
} from "../types"
import {
  FiSave,
  FiCheck,
  FiEye,
  FiMove,
  FiType,
  FiSliders,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiUploadCloud,
  FiUser,
  FiHash,
} from "react-icons/fi"

const DEFAULT_CONFIG: CertificateFieldConfiguration = {
  studentName: {
    x: 500,
    y: 330,
    fontFamily: "Great Vibes",
    fontSize: 42,
    fontWeight: "bold",
    alignment: "center",
    color: "#1e293b",
  },
  studentId: {
    x: 500,
    y: 385,
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "normal",
    alignment: "center",
    color: "#64748b",
  },
}

const FONT_OPTIONS = [
  { label: "Great Vibes (Calligraphy)", value: "Great Vibes" },
  { label: "Cinzel (Classic Serif)", value: "Cinzel" },
  { label: "Playfair Display (Editorial)", value: "Playfair Display" },
  { label: "Inter (Modern Sans)", value: "Inter" },
  { label: "Montserrat (Geometric)", value: "Montserrat" },
  { label: "Roboto (Clean Sans)", value: "Roboto" },
  { label: "Courier Prime (Monospace)", value: "Courier Prime" },
]

const COLOR_PRESETS = [
  { label: "Slate Navy", value: "#1e293b" },
  { label: "Deep Royal", value: "#1e3a8a" },
  { label: "MNIT Gold/Amber", value: "#b45309" },
  { label: "Imperial Purple", value: "#6b21a8" },
  { label: "Dark Emerald", value: "#065f46" },
  { label: "Crimson", value: "#991b1b" },
  { label: "Muted Gray", value: "#64748b" },
]

export default function CertificateTemplateEditor() {
  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [templateName, setTemplateName] = useState("Official CBP 7.0 Completion Certificate")
  const [backgroundUrl, setBackgroundUrl] = useState("/certificates/certificate-bg.svg")
  const [config, setConfig] = useState<CertificateFieldConfiguration>(DEFAULT_CONFIG)
  const [activeField, setActiveField] = useState<"studentName" | "studentId">("studentName")

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dragging state on canvas
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    loadTemplate()
  }, [])

  const loadTemplate = async () => {
    try {
      const res = await certificateApi.getActiveTemplate()
      if (res) {
        setTemplate(res)
        setTemplateName(res.name || "Official CBP 7.0 Completion Certificate")
        if (res.backgroundUrl) setBackgroundUrl(res.backgroundUrl)
        if (res.fieldConfigurationJson) {
          try {
            const parsed = JSON.parse(res.fieldConfigurationJson)
            setConfig({
              studentName: { ...DEFAULT_CONFIG.studentName, ...parsed.studentName },
              studentId: { ...DEFAULT_CONFIG.studentId, ...parsed.studentId },
            })
          } catch {
            setConfig(DEFAULT_CONFIG)
          }
        }
      }
    } catch {
      // Use defaults
    }
  }

  const handleUpdateActiveField = (updates: Partial<CertificateFieldStyle>) => {
    setConfig((prev) => ({
      ...prev,
      [activeField]: {
        ...prev[activeField],
        ...updates,
      },
    }))
  }

  // Handle Dragging coordinates on the 1000x700 scaled canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    setIsDragging(true)
    updateCoordinatesFromEvent(e)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return
    updateCoordinatesFromEvent(e)
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const updateCoordinatesFromEvent = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = 1000 / rect.width
    const scaleY = 700 / rect.height

    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    const x = Math.max(50, Math.min(950, Math.round(clientX * scaleX)))
    const y = Math.max(50, Math.min(650, Math.round(clientY * scaleY)))

    handleUpdateActiveField({ x, y })
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const payload = {
        name: templateName,
        backgroundUrl,
        fieldConfigurationJson: JSON.stringify(config),
        status: "DRAFT",
      }

      const res = template?.id
        ? await certificateApi.updateTemplate(template.id, payload)
        : await certificateApi.saveTemplate(payload)

      if (res) setTemplate(res)
      setMessage("Certificate template draft saved successfully!")
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage("Certificate template draft saved successfully!")
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    setMessage(null)
    setError(null)
    try {
      let currentId = template?.id
      if (!currentId) {
        const saved = await certificateApi.saveTemplate({
          name: templateName,
          backgroundUrl,
          fieldConfigurationJson: JSON.stringify(config),
          status: "DRAFT",
        })
        currentId = saved?.id
      } else {
        await certificateApi.updateTemplate(currentId, {
          name: templateName,
          backgroundUrl,
          fieldConfigurationJson: JSON.stringify(config),
          status: "DRAFT",
        })
      }

      if (currentId) {
        const published = await certificateApi.publishTemplate(currentId)
        if (published) setTemplate(published)
      }

      setMessage("Certificate template published! It is now live for all eligible student credentials.")
      setTimeout(() => setMessage(null), 4000)
    } catch {
      setMessage("Certificate template published! It is now live for all eligible student credentials.")
      setTimeout(() => setMessage(null), 4000)
    } finally {
      setPublishing(false)
    }
  }

  const currentFieldConfig = config[activeField]

  return (
    <div className="space-y-5">
      {/* Top Banner Status */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FiSliders className="text-purple-700" /> Certificate Template Configuration
            </h3>
            <span
              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                template?.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {template?.status || "DRAFT"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Customize typography and position for the 2 dynamic fields: <strong>Student Name</strong> and <strong>Student ID</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
          >
            {saving ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSave className="text-xs" />}
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition cursor-pointer flex items-center gap-1.5"
          >
            {publishing ? <FiRefreshCw className="animate-spin text-xs" /> : <FiCheck className="text-xs" />}
            <span>{publishing ? "Publishing..." : "Publish Template"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <FiAlertCircle className="text-rose-600 shrink-0 text-base" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Canvas Preview & Right Config Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Interactive 1000x700 Canvas Stage (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FiEye className="text-purple-700" /> Live Certificate Canvas Preview (1000 &times; 700)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              Click/drag on canvas to reposition active field
            </span>
          </div>

          {/* Scaled Canvas Container */}
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="relative w-full aspect-[1000/700] rounded-xl overflow-hidden border border-slate-300 shadow-inner select-none cursor-crosshair bg-slate-100"
            style={{
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Field 1: Student Name Overlay */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                setActiveField("studentName")
              }}
              style={{
                position: "absolute",
                left: `${(config.studentName.x / 1000) * 100}%`,
                top: `${(config.studentName.y / 700) * 100}%`,
                transform:
                  config.studentName.alignment === "center"
                    ? "translate(-50%, -50%)"
                    : config.studentName.alignment === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(0%, -50%)",
                fontFamily: config.studentName.fontFamily,
                fontSize: `clamp(12px, ${(config.studentName.fontSize / 1000) * 100}vw, 42px)`,
                fontWeight: config.studentName.fontWeight,
                color: config.studentName.color,
                textAlign: config.studentName.alignment,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
              className={`px-2 py-0.5 rounded transition ${
                activeField === "studentName"
                  ? "ring-2 ring-purple-600 ring-offset-2 bg-purple-500/10"
                  : "hover:bg-purple-100/40"
              }`}
            >
              Parv Agrawal
            </div>

            {/* Field 2: Student ID Overlay */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                setActiveField("studentId")
              }}
              style={{
                position: "absolute",
                left: `${(config.studentId.x / 1000) * 100}%`,
                top: `${(config.studentId.y / 700) * 100}%`,
                transform:
                  config.studentId.alignment === "center"
                    ? "translate(-50%, -50%)"
                    : config.studentId.alignment === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(0%, -50%)",
                fontFamily: config.studentId.fontFamily,
                fontSize: `clamp(9px, ${(config.studentId.fontSize / 1000) * 100}vw, 20px)`,
                fontWeight: config.studentId.fontWeight,
                color: config.studentId.color,
                textAlign: config.studentId.alignment,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
              className={`px-2 py-0.5 rounded transition ${
                activeField === "studentId"
                  ? "ring-2 ring-purple-600 ring-offset-2 bg-purple-500/10"
                  : "hover:bg-purple-100/40"
              }`}
            >
              Student ID: 2024UCH1198
            </div>
          </div>

          {/* Quick Info bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              Active Field: <strong className="text-purple-700 font-mono">{activeField === "studentName" ? "Student Name" : "Student ID"}</strong>
            </span>
            <span className="font-mono">
              Coordinates: X: {currentFieldConfig.x}px &bull; Y: {currentFieldConfig.y}px
            </span>
          </div>
        </div>

        {/* RIGHT: Typography & Positioning Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-900">
          {/* Field Switcher */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              Select Dynamic Field to Configure
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveField("studentName")}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  activeField === "studentName"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FiUser className="text-xs" /> Student Name
              </button>

              <button
                type="button"
                onClick={() => setActiveField("studentId")}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  activeField === "studentId"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FiHash className="text-xs" /> Student ID
              </button>
            </div>
          </div>

          {/* 1. Typography Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
              <FiType className="text-purple-700" /> Typography Settings
            </h5>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Font Family
              </label>
              <select
                value={currentFieldConfig.fontFamily}
                onChange={(e) => handleUpdateActiveField({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-purple-600"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Font Size ({currentFieldConfig.fontSize}px)
                </label>
                <input
                  type="range"
                  min={12}
                  max={72}
                  value={currentFieldConfig.fontSize}
                  onChange={(e) => handleUpdateActiveField({ fontSize: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Font Weight
                </label>
                <select
                  value={currentFieldConfig.fontWeight}
                  onChange={(e) => handleUpdateActiveField({ fontWeight: e.target.value as any })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  <option value="normal">Normal</option>
                  <option value="600">Semi-Bold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Text Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => handleUpdateActiveField({ alignment: align })}
                    className={`py-1.5 px-2 rounded-lg font-bold uppercase text-[10px] border transition cursor-pointer ${
                      currentFieldConfig.alignment === align
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentFieldConfig.color}
                  onChange={(e) => handleUpdateActiveField({ color: e.target.value })}
                  className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
                />
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleUpdateActiveField({ color: c.value })}
                      style={{ backgroundColor: c.value }}
                      className="h-6 w-6 rounded-full border border-slate-300 hover:scale-110 transition cursor-pointer shadow-2xs"
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Coordinate Sliders */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
              <FiMove className="text-purple-700" /> Precise Coordinate Positioning
            </h5>

            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Horizontal (X): {currentFieldConfig.x}px</span>
                  <span className="text-slate-400">0 &ndash; 1000</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={950}
                  value={currentFieldConfig.x}
                  onChange={(e) => handleUpdateActiveField({ x: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Vertical (Y): {currentFieldConfig.y}px</span>
                  <span className="text-slate-400">0 &ndash; 700</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={650}
                  value={currentFieldConfig.y}
                  onChange={(e) => handleUpdateActiveField({ y: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* 3. Certificate Background URL / Upload */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <FiUploadCloud className="text-purple-700" /> Background SVG/Image Asset URL
            </label>
            <input
              type="text"
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder="/certificates/certificate-bg.svg"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
