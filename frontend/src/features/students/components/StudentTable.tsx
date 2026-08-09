"use client"

import React from "react"
import { AdminStudentListItem } from "../types"
import { PageResponse } from "@/types/attendance"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { FiEye } from "react-icons/fi"

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
  const content = studentsPage?.content || []

  // Mobile Decision Cards View (375px, 390px, 412px, 768px)
  const mobileCards = content.map((item) => {
    const isSelected = selectedStudentIds.includes(item.studentId)
    const isEligible = item.attendancePercentage >= 75.0
    const isPaid = item.paymentStatus === "SUCCESS"

    return (
      <MobileRecordCard
        key={item.studentId}
        title={item.name}
        subtitle={item.studentId}
        status={item.paymentStatus}
        statusLabel={isPaid ? "Paid" : "Pending"}
        selected={isSelected}
        onClick={() => handleOpenStudentProfile(item.studentId)}
        fields={[
          {
            label: "Payment",
            value: (
              <span className={`font-semibold text-xs ${isPaid ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}`}>
                {isPaid ? "Completed" : "Pending"}
              </span>
            ),
          },
          {
            label: "Attendance",
            value: (
              <span className={`font-mono font-extrabold text-xs ${isEligible ? "text-emerald-700" : "text-slate-800"}`}>
                {item.attendancePercentage.toFixed(1)}%
              </span>
            ),
          },
        ]}
        actions={
          <button
            onClick={(e) => handleOpenStudentProfile(item.studentId, e)}
            className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FiEye className="text-xs" />
            <span>View Profile</span>
          </button>
        }
      />
    )
  })

  return (
    <DataTable
      title="Student Directory"
      totalCount={studentsPage?.totalElements}
      selectedCount={selectedStudentIds.length}
      loading={loading}
      data={content}
      currentPage={studentsPage?.number ?? 0}
      totalPages={studentsPage?.totalPages ?? 1}
      pageSize={studentsPage?.size ?? 20}
      onPageChange={(p) => setPage(() => p)}
      emptyMessage="No registered students found"
      emptySubtext="No matching student records for current search or filters."
      mobileView={mobileCards.length > 0 ? <>{mobileCards}</> : null}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
          <tr>
            <th className="px-3.5 py-2.5 text-center w-10">
              <input
                type="checkbox"
                checked={
                  selectedStudentIds.length === content.length &&
                  content.length > 0
                }
                onChange={toggleSelectAll}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                aria-label="Select all students"
              />
            </th>
            <th className="px-4 py-2.5">Student ID</th>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Email</th>
            <th className="px-4 py-2.5">Phone</th>
            <th className="px-4 py-2.5">Branch</th>
            <th className="px-4 py-2.5">Registration</th>
            <th className="px-4 py-2.5">Fee Status</th>
            <th className="px-4 py-2.5">Attendance</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
          {content.map((item) => {
            const isSelected = selectedStudentIds.includes(item.studentId)
            const isEligible = item.attendancePercentage >= 75.0

            return (
              <tr
                key={item.studentId}
                onClick={() => handleOpenStudentProfile(item.studentId)}
                className={`hover:bg-cyan-50/25 transition cursor-pointer ${
                  isSelected ? "bg-cyan-50/35" : ""
                }`}
              >
                <td className="px-3.5 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectStudent(item.studentId)}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    aria-label={`Select student ${item.name}`}
                  />
                </td>

                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                  {item.studentId}
                </td>

                <td className="px-4 py-2.5 font-bold text-slate-900">
                  {item.name}
                </td>

                <td className="px-4 py-2.5 font-mono text-slate-600 truncate max-w-[180px]">
                  {item.email}
                </td>

                <td className="px-4 py-2.5 font-mono text-slate-600">
                  {item.phone || "—"}
                </td>

                <td className="px-4 py-2.5 text-slate-700">
                  {item.course} {item.branch}
                </td>

                <td className="px-4 py-2.5">
                  <StatusBadge status={item.registrationStatus} />
                </td>

                <td className="px-4 py-2.5">
                  <StatusBadge
                    status={item.paymentStatus}
                    label={item.paymentStatus === "SUCCESS" ? "PAID" : "PENDING"}
                  />
                </td>

                <td className="px-4 py-2.5">
                  <span
                    className={`font-mono font-bold text-xs ${
                      isEligible ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {item.attendancePercentage.toFixed(1)}%
                  </span>
                </td>

                <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleOpenStudentProfile(item.studentId, e)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                    title="View Student Profile"
                  >
                    <FiEye className="text-slate-600 text-xs" /> View Profile
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </DataTable>
  )
}
