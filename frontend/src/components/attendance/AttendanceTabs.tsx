"use client"

import { FiUser, FiSliders, FiCamera } from "react-icons/fi"

export type AttendanceTabMode = "student" | "admin" | "volunteer"

interface AttendanceTabsProps {
  activeTab: AttendanceTabMode
  onTabChange: (tab: AttendanceTabMode) => void
}

export default function AttendanceTabs({ activeTab, onTabChange }: AttendanceTabsProps) {
  const tabs = [
    {
      id: "student" as AttendanceTabMode,
      label: "Student View",
      sublabel: "My Attendance & Schedule",
      icon: <FiUser />,
    },
    {
      id: "admin" as AttendanceTabMode,
      label: "Admin View",
      sublabel: "Session CRUD & Analytics",
      icon: <FiSliders />,
    },
    {
      id: "volunteer" as AttendanceTabMode,
      label: "Volunteer View",
      sublabel: "Session QR Scanner",
      icon: <FiCamera />,
    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`p-3 rounded-xl transition-all duration-200 text-left flex items-center gap-3 ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
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
                <h4 className="text-xs font-bold truncate">{tab.label}</h4>
                <p className={`text-[10px] truncate ${isActive ? "text-slate-300" : "text-slate-500"}`}>
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
