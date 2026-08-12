"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EligibleStudentQrItem, PageResponse } from "@/types/attendance"

interface StudentQrSelectionTableProps {
  dataPage: PageResponse<EligibleStudentQrItem> | null
  loading: boolean
  search: string
  onSearchChange: (search: string) => void
  qrFilter: string
  onQrFilterChange: (filter: string) => void
  page: number
  onPageChange: (page: number) => void
  selectedStudentIds: Set<string>
  onToggleSelectStudent: (studentId: string) => void
  onToggleSelectAll: () => void
}

export function StudentQrSelectionTable({
  dataPage,
  loading,
  search,
  onSearchChange,
  qrFilter,
  onQrFilterChange,
  page,
  onPageChange,
  selectedStudentIds,
  onToggleSelectStudent,
  onToggleSelectAll,
}: StudentQrSelectionTableProps) {
  const eligibleItems = dataPage?.content || []
  const allCurrentPageSelected =
    eligibleItems.length > 0 && eligibleItems.every((item) => selectedStudentIds.has(item.studentId))

  return (
    <div className="space-y-3">
      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search student by Name, Student ID, Email..."
        filters={[
          {
            id: "qrFilter",
            value: qrFilter,
            onChange: onQrFilterChange,
            options: [
              { label: "All QR Statuses", value: "ALL" },
              { label: "Missing QR", value: "MISSING" },
              { label: "Generated QR", value: "GENERATED" },
            ],
          },
        ]}
      />

      <DataTable
        title="Eligible Student Management Table"
        totalCount={dataPage?.totalElements}
        loading={loading}
        data={eligibleItems}
        currentPage={page}
        totalPages={dataPage?.totalPages ?? 1}
        pageSize={20}
        onPageChange={onPageChange}
        emptyMessage="No eligible students found matching search criteria"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
            <tr>
              <th className="px-3 py-2.5 text-center w-10">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                  title="Select all eligible students on this page"
                />
              </th>
              <th className="px-4 py-2.5">Student Name</th>
              <th className="px-4 py-2.5">Student ID</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Registration</th>
              <th className="px-4 py-2.5">Payment</th>
              <th className="px-4 py-2.5">QR Status</th>
              <th className="px-4 py-2.5">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {eligibleItems.map((item) => {
              const isSelected = selectedStudentIds.has(item.studentId)
              return (
                <tr
                  key={item.studentId}
                  className={`transition ${isSelected ? "bg-cyan-50/30" : "hover:bg-slate-50/70"}`}
                >
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectStudent(item.studentId)}
                      className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{item.studentId}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{item.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.registrationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        item.qrStatus === "GENERATED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {item.qrStatus === "GENERATED" ? "Generated" : "Missing"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={item.attendanceStatus} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataTable>
    </div>
  )
}
