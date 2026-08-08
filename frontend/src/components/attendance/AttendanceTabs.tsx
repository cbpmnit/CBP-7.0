"use client"

import { FiUser, FiSliders, FiCamera } from "react-icons/fi"

export type AttendanceViewMode = "student" | "admin" | "volunteer"

interface AttendanceTabsProps {
  activeView: AttendanceViewMode
  onViewChange: (view: AttendanceViewMode) => void
}

export default function AttendanceTabs({ activeView, onViewChange }: AttendanceTabsProps) {
  const tabs = [
    {
      id: "student" as AttendanceViewMode,
      label: "Student View",
      sublabel: "Show My QR",
      icon: <FiUser />,
      permissionRole: "STUDENT (VIEW_STUDENT_QR)",
    },
    {
      id: "admin" as AttendanceViewMode,
      label: "Admin View",
      sublabel: "Create & Manage QR",
      icon: <FiSliders />,
      permissionRole: "ADMIN (GENERATE_SESSION_QR)",
    },
    {
      id: "volunteer" as AttendanceViewMode,
      label: "Volunteer Scanner",
      sublabel: "Scan & Mark Attendance",
      icon: <FiCamera />,
      permissionRole: "VOLUNTEER (SCAN_QR)",
    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`p-3 rounded-xl transition-all duration-200 text-left flex items-center gap-3 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-cyan-700 border border-slate-200"
                }`}
              >
                {tab.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold truncate">{tab.label}</h4>
                </div>
                <p className={`text-[10px] truncate ${isActive ? "text-cyan-100" : "text-slate-500"}`}>
                  {tab.sublabel}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
