"use client"

import { useState } from "react"
import AttendanceTabs, { AttendanceTabMode } from "./AttendanceTabs"
import StudentAttendanceView from "./StudentAttendanceView"
import AdminAttendanceView from "./AdminAttendanceView"
import VolunteerScannerView from "./VolunteerScannerView"
import { FiCamera } from "react-icons/fi"

interface AttendanceModuleProps {
  initialTab?: AttendanceTabMode
}

export default function AttendanceModule({ initialTab = "student" }: AttendanceModuleProps) {
  const [activeTab, setActiveTab] = useState<AttendanceTabMode>(initialTab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-cyan-700 text-2xl"><FiCamera /></span>
            <span>Attendance Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Session-based workshop tracking, live gate scanning, and student attendance logs.
          </p>
        </div>
      </div>

      {/* Segregated Navigation Tabs */}
      <AttendanceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Tab View */}
      {activeTab === "student" && <StudentAttendanceView />}
      {activeTab === "admin" && <AdminAttendanceView />}
      {activeTab === "volunteer" && <VolunteerScannerView />}
    </div>
  )
}
