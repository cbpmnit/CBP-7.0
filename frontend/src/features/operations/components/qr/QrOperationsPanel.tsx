"use client"

import { useState, useEffect, useCallback } from "react"
import { attendanceService } from "@/services/attendanceService"
import { StudentQrSelectionTable } from "./StudentQrSelectionTable"
import {
  EligibleStudentQrItem,
  PageResponse,
  BatchQrGenerationResponse,
  AttendanceSessionDto,
} from "@/types/attendance"
import {
  FiZap,
  FiRefreshCw,
  FiCheckSquare,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi"

interface QrOperationsPanelProps {
  sessions: AttendanceSessionDto[]
  selectedSessionId: string
  onSessionChange: (sessionId: string) => void
  onRefreshNeeded: () => void
}

export function QrOperationsPanel({
  sessions,
  selectedSessionId,
  onSessionChange,
  onRefreshNeeded,
}: QrOperationsPanelProps) {
  const [dataPage, setDataPage] = useState<PageResponse<EligibleStudentQrItem> | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [qrFilter, setQrFilter] = useState("ALL")
  const [page, setPage] = useState(0)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())

  // QR Action & Modal State
  const [generating, setGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<BatchQrGenerationResponse | null>(null)
  const [regenerationWarning, setRegenerationWarning] = useState<{
    show: boolean
    attendedStudentCount: number
    attendedStudentNames: string[]
  }>({ show: false, attendedStudentCount: 0, attendedStudentNames: [] })

  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadEligibleStudents = useCallback(async () => {
    if (!selectedSessionId) return
    setLoading(true)
    try {
      const data = await attendanceService.getEligibleStudentsForSessionQr(
        selectedSessionId,
        search,
        qrFilter,
        page,
        20
      )
      setDataPage(data)
    } catch (err) {
      console.error("Failed to load eligible students for QR generation", err)
    } finally {
      setLoading(false)
    }
  }, [selectedSessionId, search, qrFilter, page])

  useEffect(() => {
    loadEligibleStudents()
  }, [loadEligibleStudents])

  useEffect(() => {
    setSelectedStudentIds(new Set())
    setPage(0)
  }, [selectedSessionId])

  const eligibleItems = dataPage?.content || []
  const allCurrentPageSelected =
    eligibleItems.length > 0 && eligibleItems.every((item) => selectedStudentIds.has(item.studentId))

  const handleToggleSelectAll = () => {
    const updated = new Set(selectedStudentIds)
    if (allCurrentPageSelected) {
      eligibleItems.forEach((item) => updated.delete(item.studentId))
    } else {
      eligibleItems.forEach((item) => updated.add(item.studentId))
    }
    setSelectedStudentIds(updated)
  }

  const handleToggleSelectStudent = (studentId: string) => {
    const updated = new Set(selectedStudentIds)
    if (updated.has(studentId)) {
      updated.delete(studentId)
    } else {
      updated.add(studentId)
    }
    setSelectedStudentIds(updated)
  }

  const refreshData = async () => {
    await loadEligibleStudents()
    onRefreshNeeded()
  }

  // Action 1: Generate Missing QR
  const handleGenerateMissingQrs = async () => {
    if (!selectedSessionId) return
    setGenerating(true)
    setActionMessage(null)
    setErrorMessage(null)
    try {
      const res = await attendanceService.generateStudentQrsForSession(selectedSessionId, "MISSING_ONLY")
      setGenerationResult(res)
      await refreshData()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate missing QR passes.")
    } finally {
      setGenerating(false)
    }
  }

  // Action 2: Generate Selected QR
  const handleGenerateSelectedQrs = async () => {
    if (!selectedSessionId) return
    if (selectedStudentIds.size === 0) {
      alert("Please select at least one student checkbox from the table.")
      return
    }

    setGenerating(true)
    setActionMessage(null)
    setErrorMessage(null)
    try {
      const targetIds = Array.from(selectedStudentIds)
      const res = await attendanceService.generateSelectedQrs(selectedSessionId, targetIds)
      setGenerationResult(res)
      await refreshData()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate QR passes for selected students.")
    } finally {
      setGenerating(false)
    }
  }

  // Action 3: Regenerate Selected QR
  const handleRegenerateSelectedQrsClick = async () => {
    if (!selectedSessionId) return
    if (selectedStudentIds.size === 0) {
      alert("Please select at least one student checkbox from the table.")
      return
    }

    const selectedList = eligibleItems.filter((item) => selectedStudentIds.has(item.studentId))
    const attendedList = selectedList.filter((item) => item.attendanceStatus === "PRESENT")

    if (attendedList.length > 0) {
      setRegenerationWarning({
        show: true,
        attendedStudentCount: attendedList.length,
        attendedStudentNames: attendedList.map((item) => `${item.name} (${item.studentId})`),
      })
      return
    }

    executeRegeneration(false)
  }

  const executeRegeneration = async (force: boolean) => {
    if (!selectedSessionId) return
    setRegenerationWarning({ show: false, attendedStudentCount: 0, attendedStudentNames: [] })
    setGenerating(true)
    setActionMessage(null)
    setErrorMessage(null)

    try {
      const targetIds = Array.from(selectedStudentIds)
      const res = await attendanceService.regenerateSelectedQrs(selectedSessionId, targetIds, force)
      setGenerationResult(res)
      await refreshData()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to regenerate QR passes.")
    } finally {
      setGenerating(false)
    }
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <FiZap className="text-base" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              QR Pass Generation &amp; Regeneration
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate, selectively issue, and regenerate student QR gate passes.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Target Workshop Session</label>
          <select
            value={selectedSessionId}
            onChange={(e) => onSessionChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">Select Session...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Day {s.dayNumber}: {s.title} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <FiCheckCircle className="text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
          <FiAlertTriangle className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateMissingQrs}
            disabled={generating || selectedSession?.status === "CLOSED" || !selectedSessionId}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
            title="Generate QR passes for all eligible enrolled students without an active pass"
          >
            {generating ? (
              <FiRefreshCw className="animate-spin text-xs" />
            ) : (
              <FiZap className="text-xs" />
            )}
            <span>Generate Missing QR</span>
          </button>

          <button
            onClick={handleGenerateSelectedQrs}
            disabled={generating || selectedStudentIds.size === 0 || selectedSession?.status === "CLOSED"}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
            title="Generate QR pass only for selected student checkboxes"
          >
            <FiCheckSquare className="text-xs" />
            <span>Generate Selected QR ({selectedStudentIds.size})</span>
          </button>

          <button
            onClick={handleRegenerateSelectedQrsClick}
            disabled={generating || selectedStudentIds.size === 0 || selectedSession?.status === "CLOSED"}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
            title="Regenerate QR pass for selected student checkboxes"
          >
            <FiRefreshCw className="text-xs" />
            <span>Regenerate Selected QR ({selectedStudentIds.size})</span>
          </button>
        </div>

        {selectedStudentIds.size > 0 && (
          <button
            onClick={() => setSelectedStudentIds(new Set())}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Eligible Student Management Table */}
      <StudentQrSelectionTable
        dataPage={dataPage}
        loading={loading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(0)
        }}
        qrFilter={qrFilter}
        onQrFilterChange={(val) => {
          setQrFilter(val)
          setPage(0)
        }}
        page={page}
        onPageChange={(p) => setPage(p)}
        selectedStudentIds={selectedStudentIds}
        onToggleSelectStudent={handleToggleSelectStudent}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Regeneration Warning Modal */}
      {regenerationWarning.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                <FiAlertTriangle className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Attendance Already Marked
                </h3>
                <p className="text-xs text-amber-700">
                  This student has already marked attendance. Regenerating QR may affect previous attendance validation. Continue?
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <p className="font-bold">
                {regenerationWarning.attendedStudentCount} selected student(s) have already marked attendance PRESENT:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                {regenerationWarning.attendedStudentNames.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRegenerationWarning({ show: false, attendedStudentCount: 0, attendedStudentNames: [] })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeRegeneration(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                Force Regenerate Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Report Modal */}
      {generationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center text-lg">
                  <FiCheckCircle />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    QR Generation Report
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Batch execution completed
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGenerationResult(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-emerald-800">Generated</span>
                <p className="text-xl font-black text-emerald-950 font-mono">
                  {generationResult.generatedCount ?? generationResult.generated ?? 0}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-500">Skipped</span>
                <p className="text-xl font-black text-slate-800 font-mono">
                  {generationResult.skippedCount ?? 0}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-0.5 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-900">Skipped: Already Attended</span>
                  <span className="font-mono font-bold text-amber-950 text-base">
                    {generationResult.alreadyAttendedCount ?? 0}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Protected &amp; skipped because attendance was already marked PRESENT.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-600">Skipped: Already Has QR</span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {generationResult.alreadyHasQrCount ?? 0}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Skipped because student already possesses an active QR pass.
                </p>
              </div>
            </div>

            <button
              onClick={() => setGenerationResult(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
