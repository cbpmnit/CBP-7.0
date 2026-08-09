"use client"

import React from "react"
import { AdminStudentListItem } from "../types"
import { PageResponse } from "@/types/attendance"
import {
  FiUsers,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi"

interface StudentTableProps {
  studentsPage: PageResponse<AdminStudentListItem> | null
  loading: boolean
  selectedStudentIds: string[]
  toggleSelectAll: () => void
  toggleSelectStudent: (studentId: string) => void
  handleOpenStudentProfile: (studentId: string, e?: React.MouseEvent) => void
  setPage: (updater: (prev: number) => number) => void
}

export default function StudentTable({
  studentsPage,
  loading,
  selectedStudentIds,
  toggleSelectAll,
  toggleSelectStudent,
  handleOpenStudentProfile,
  setPage,
}: StudentTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Student Roster Directory
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            ({studentsPage?.totalElements ?? 0} Total)
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          {selectedStudentIds.length > 0 && (
            <span className="font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              {selectedStudentIds.length} Selected
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100/80 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !studentsPage || studentsPage.content.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-2">
          <FiUsers className="text-3xl mx-auto text-slate-300" />
          <h3 className="text-xs font-bold text-slate-700">No registered students found</h3>
          <p className="text-[11px] text-slate-400">
            There are no student records matching your current search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudentIds.length === studentsPage.content.length &&
                      studentsPage.content.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                </th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Course / Branch</th>
                <th className="px-6 py-3.5">Registration</th>
                <th className="px-6 py-3.5">Payment Status</th>
                <th className="px-6 py-3.5">Attendance %</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {studentsPage.content.map((item) => {
                const isSelected = selectedStudentIds.includes(item.studentId)
                const isPaid = item.paymentStatus === "SUCCESS"
                const isEligible = item.attendancePercentage >= 75.0

                return (
                  <tr
                    key={item.studentId}
                    onClick={() => handleOpenStudentProfile(item.studentId)}
                    className={`hover:bg-cyan-50/30 transition cursor-pointer ${
                      isSelected ? "bg-cyan-50/40" : ""
                    }`}
                  >
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStudent(item.studentId)}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {item.studentId}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600">
                      {item.email}
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600">
                      {item.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-800">
                      {item.course} - {item.branch}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {item.registrationStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {isPaid ? <FiCheckCircle /> : <FiClock />}
                        {isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`font-mono font-extrabold text-xs ${
                          isEligible ? "text-emerald-700" : "text-slate-600"
                        }`}
                      >
                        {item.attendancePercentage.toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenStudentProfile(item.studentId, e)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-[11px] font-bold shadow-xs transition inline-flex items-center gap-1"
                      >
                        <FiEye /> View Profile
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Server-side Pagination Bar */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page <strong className="text-slate-900">{studentsPage.number + 1}</strong> of{" "}
              <strong className="text-slate-900">{Math.max(studentsPage.totalPages, 1)}</strong> (
              {studentsPage.totalElements} total students)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={studentsPage.first}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition inline-flex items-center gap-1 font-bold text-xs shadow-xs"
              >
                <FiChevronLeft /> Previous
              </button>
              <button
                onClick={() => setPage((p) => (studentsPage.last ? p : p + 1))}
                disabled={studentsPage.last}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition inline-flex items-center gap-1 font-bold text-xs shadow-xs"
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
