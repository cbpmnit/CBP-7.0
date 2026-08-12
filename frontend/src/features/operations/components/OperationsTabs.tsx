"use client"

import { FiZap, FiMail } from "react-icons/fi"

interface OperationsTabsProps {
  activeTab: "qr" | "email"
  onTabChange: (tab: "qr" | "email") => void
}

export function OperationsTabs({ activeTab, onTabChange }: OperationsTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-0 mb-4">
      <button
        onClick={() => onTabChange("qr")}
        className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center gap-2 ${
          activeTab === "qr"
            ? "border-cyan-600 text-cyan-800 bg-cyan-50/50 rounded-t-xl"
            : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
        }`}
      >
        <FiZap className="text-sm text-cyan-600" />
        <span>QR Pass Operations</span>
      </button>

      <button
        onClick={() => onTabChange("email")}
        className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center gap-2 ${
          activeTab === "email"
            ? "border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl"
            : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
        }`}
      >
        <FiMail className="text-sm text-emerald-600" />
        <span>Email Operations</span>
      </button>
    </div>
  )
}
