"use client"

import { useState } from "react"
import { ColumnPreferences } from "@/services/adminStudentService"
import { FiX, FiCheck, FiSliders } from "react-icons/fi"

interface ColumnCustomizerModalProps {
  initialPrefs: ColumnPreferences
  isOpen: boolean
  onClose: () => void
  onSave: (prefs: ColumnPreferences) => void
}

export default function ColumnCustomizerModal({
  initialPrefs,
  isOpen,
  onClose,
  onSave,
}: ColumnCustomizerModalProps) {
  const [prefs, setPrefs] = useState<ColumnPreferences>(initialPrefs)

  if (!isOpen) return null

  const toggleColumn = (key: keyof ColumnPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    onSave(prefs)
    onClose()
  }

  const columnsList: { key: keyof ColumnPreferences; label: string; description: string }[] = [
    { key: "showEmail", label: "Email Address", description: "Display student official email column" },
    { key: "showPhone", label: "Phone Number", description: "Display contact mobile number" },
    { key: "showBranch", label: "Branch & Course", description: "Display academic course and branch" },
    { key: "showRegistration", label: "Registration Status", description: "Display CBP registration stage badge" },
    { key: "showPayment", label: "Payment Status", description: "Display PhonePe fee status badge" },
    { key: "showAttendance", label: "Attendance %", description: "Display calculated workshop attendance %" },
  ]

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FiSliders className="text-cyan-700 text-lg" />
            <h3 className="text-sm font-extrabold text-slate-900">Customize Table Columns</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">
            <FiX />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Select which data columns you want visible in the student management directory table. Preferences are saved to your admin profile.
        </p>

        <div className="space-y-2.5">
          {columnsList.map((col) => {
            const isChecked = prefs[col.key]
            return (
              <div
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isChecked
                    ? "bg-cyan-50/60 border-cyan-300 text-cyan-950"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{col.label}</h4>
                  <p className="text-[10px] text-slate-500">{col.description}</p>
                </div>
                <div
                  className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs transition ${
                    isChecked
                      ? "bg-cyan-600 border-cyan-600 text-white"
                      : "bg-white border-slate-300 text-transparent"
                  }`}
                >
                  <FiCheck />
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
