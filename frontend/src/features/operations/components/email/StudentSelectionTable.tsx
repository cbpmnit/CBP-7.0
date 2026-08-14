"use client"

import { useState, useEffect, useCallback } from "react"
import { attendanceService } from "@/services/attendanceService"
import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EligibleStudentQrItem, PageResponse } from "@/types/attendance"

interface StudentSelectionTableProps {
  selectedSessionId: string
  selectedStudentIds: Set<string>
  selectedStudentEmails: Set<string>
  onToggleSelectStudent: (studentId: string, email: string) => void
  onToggleSelectAll: (items: EligibleStudentQrItem[]) => void
}

export function StudentSelectionTable({
  selectedSessionId,
  selectedStudentIds,
  selectedStudentEmails,
  onToggleSelectStudent,
  onToggleSelectAll,
}: StudentSelectionTableProps) {
  const [dataPage, setDataPage] = useState<PageResponse<EligibleStudentQrItem> | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  const loadStudents = useCallback(async () => {
    if (!selectedSessionId || selectedSessionId.trim() === "") {
      setDataPage(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await attendanceService.getEligibleStudentsForSessionQr(
        selectedSessionId,
        search,
        "ALL",
        page,
        20
      )
      setDataPage(data)
    } catch (err) {
      console.error("Failed to load students for email selection", err)
    } finally {
      setLoading(false)
    }
  }, [selectedSessionId, search, page])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const items = dataPage?.content || []
  const allCurrentPageSelected =
    items.length > 0 && items.every((item) => selectedStudentIds.has(item.studentId))

  return (
    <div className="space-y-3">
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(0)
        }}
        searchPlaceholder="Search student by Name, Student ID, Email..."
      />

      <DataTable
        title="Searchable Student Selection Table"
        totalCount={dataPage?.totalElements}
        loading={loading}
        data={items}
        currentPage={page}
        totalPages={dataPage?.totalPages ?? 1}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No students found matching search"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
            <tr>
              <th className="px-3 py-2.5 text-center w-10">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={() => onToggleSelectAll(items)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                  title="Select all students on this page"
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
            {items.map((item) => {
              const isSelected = selectedStudentIds.has(item.studentId)
              return (
                <tr
                  key={item.studentId}
                  className={`transition ${isSelected ? "bg-emerald-50/40" : "hover:bg-slate-50/70"}`}
                >
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectStudent(item.studentId, item.email)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
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
