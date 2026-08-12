"use client"

import { FiUserCheck, FiUsers } from "react-icons/fi"

export type RecipientSelectionMode = "MANUAL" | "GROUP"

export interface RecipientSelectorProps {
  mode: RecipientSelectionMode
  onModeChange: (mode: RecipientSelectionMode) => void
  selectedGroup: string
  onGroupChange: (group: string) => void
  selectedStudentCount: number
  onClearManualSelection: () => void
}

export function RecipientSelector({
  mode,
  onModeChange,
  selectedGroup,
  onGroupChange,
  selectedStudentCount,
  onClearManualSelection,
}: RecipientSelectorProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Section 1: Recipient Selection Mode
        </h4>
        {mode === "MANUAL" && selectedStudentCount > 0 && (
          <button
            onClick={onClearManualSelection}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
          >
            Clear Selected ({selectedStudentCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* MODE A */}
        <div
          onClick={() => onModeChange("MANUAL")}
          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
            mode === "MANUAL"
              ? "bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
              : "bg-white/60 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className={`p-2 rounded-lg ${mode === "MANUAL" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
            <FiUserCheck className="text-lg" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase text-slate-900 block">
              MODE A: Select Students Manually
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pick individual students from the table using checkboxes.
            </p>
            {mode === "MANUAL" && (
              <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono">
                {selectedStudentCount} Student(s) Selected
              </span>
            )}
          </div>
        </div>

        {/* MODE B */}
        <div
          onClick={() => onModeChange("GROUP")}
          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
            mode === "GROUP"
              ? "bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
              : "bg-white/60 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className={`p-2 rounded-lg ${mode === "GROUP" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
            <FiUsers className="text-lg" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-extrabold uppercase text-slate-900 block">
              MODE B: Recipient Groups
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
              Send bulk email to predefined groups.
            </p>
            {mode === "GROUP" && (
              <select
                value={selectedGroup}
                onChange={(e) => onGroupChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL_STUDENTS">All Registered Students</option>
                <option value="PAID_STUDENTS">Paid Students</option>
                <option value="QR_GENERATED">Students with Generated QR</option>
                <option value="QR_MISSING">Students without Generated QR</option>
                <option value="ATTENDED_STUDENTS">Students Who Attended Session</option>
                <option value="ABSENT_STUDENTS">Students Who Missed Session</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
