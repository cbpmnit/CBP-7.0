"use client"

import { AttendanceRecordResponse } from "@/types/attendance"
import { FiCheck, FiX, FiCalendar, FiClock } from "react-icons/fi"

interface AttendanceTableProps {
  records: AttendanceRecordResponse[]
  loading?: boolean
}

export default function AttendanceTable({ records, loading }: AttendanceTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center animate-pulse shadow-sm">
        <div className="h-6 w-48 bg-slate-100 rounded mx-auto mb-4" />
        <div className="h-24 bg-slate-50 rounded" />
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <FiCalendar className="mx-auto text-4xl text-slate-400 mb-3" />
        <h4 className="text-base font-bold text-slate-900 mb-1">No Attendance Records Found</h4>
        <p className="text-xs text-slate-600">Your attendance will appear here once marked by program volunteers.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="text-sm font-bold text-slate-900">Attendance History Log</h3>
        <span className="text-xs font-mono text-cyan-800 font-semibold">Total Entries: {records.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/70 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Time</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Marked By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((record) => {
              const isPresent = record.status === "PRESENT"
              return (
                <tr key={record.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5 font-mono text-slate-900 font-semibold flex items-center gap-2">
                    <FiCalendar className="text-cyan-700" />
                    <span>{record.attendanceDate}</span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="text-slate-400" />
                      <span>{record.attendanceTime ? record.attendanceTime.split("T")[1]?.substring(0, 8) || record.attendanceTime : "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                        isPresent
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border border-rose-200 text-rose-800"
                      }`}
                    >
                      {isPresent ? <FiCheck className="text-xs" /> : <FiX className="text-xs" />}
                      <span>{record.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                    {record.markedBy || "Volunteer"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
