"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import ColumnCustomizerModal from "@/components/admin/ColumnCustomizerModal"
import {
  adminStudentService,
  AdminStudentListItem,
  AdminDashboardStats,
  ColumnPreferences,
} from "@/services/adminStudentService"
import { PageResponse } from "@/types/attendance"
import {
  FiUsers,
  FiCreditCard,
  FiClock,
  FiAward,
  FiSearch,
  FiDownload,
  FiSliders,
  FiEye,
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiEdit,
} from "react-icons/fi"

export default function AdminStudentDashboardPage() {
  const router = useRouter()

  // State
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [studentsPage, setStudentsPage] = useState<PageResponse<AdminStudentListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [regFilter, setRegFilter] = useState("ALL")
  const [payFilter, setPayFilter] = useState("ALL")
  const [attFilter, setAttFilter] = useState("ALL")
  const [profFilter, setProfFilter] = useState("ALL")
  const [page, setPage] = useState(0)

  // Column preferences
  const [columnPrefs, setColumnPrefs] = useState<ColumnPreferences>({
    showEmail: true,
    showPhone: true,
    showBranch: true,
    showPayment: true,
    showAttendance: true,
    showRegistration: true,
  })
  const [showColumnModal, setShowColumnModal] = useState(false)

  // Selected Checkboxes
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [search, regFilter, payFilter, attFilter, profFilter, page])

  const loadInitialData = async () => {
    try {
      const [statsRes, prefsRes] = await Promise.allSettled([
        adminStudentService.getDashboardStats(),
        adminStudentService.getAdminPreferences(),
      ])

      if (statsRes.status === "fulfilled") setStats(statsRes.value)
      if (prefsRes.status === "fulfilled" && prefsRes.value) setColumnPrefs(prefsRes.value)
    } catch (err) {
      console.error("Failed to load admin initial metadata", err)
    }
  }

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await adminStudentService.getStudents(
        search,
        regFilter,
        payFilter,
        attFilter,
        profFilter,
        page,
        15
      )
      setStudentsPage(data)
    } catch (err) {
      console.error("Failed to load students directory", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      await adminStudentService.exportStudentsCsv(payFilter, regFilter, search)
    } catch (err) {
      console.error("Export failed", err)
    } finally {
      setExporting(false)
    }
  }

  const handlePrintPdf = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await adminStudentService.downloadStudentPdf(studentId)
    } catch (err) {
      console.error("PDF download failed", err)
    }
  }

  const handleSavePreferences = async (newPrefs: ColumnPreferences) => {
    setColumnPrefs(newPrefs)
    try {
      await adminStudentService.saveAdminPreferences(newPrefs)
    } catch (err) {
      console.error("Failed to save column preferences", err)
    }
  }

  const toggleSelectAll = () => {
    if (!studentsPage?.content) return
    if (selectedStudentIds.length === studentsPage.content.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(studentsPage.content.map((s) => s.studentId))
    }
  }

  const toggleSelectStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId))
    } else {
      setSelectedStudentIds((prev) => [...prev, studentId])
    }
  }

  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
      <SidebarNavigation />

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-2xl shrink-0">
                <FiShield />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  Organizer Control Console
                </span>
                <h1 className="text-xl font-extrabold mt-1 text-white">Student Management System</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowColumnModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-1.5 border border-slate-700 shadow-sm"
              >
                <FiSliders /> Customize Columns
              </button>
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 shrink-0"
              >
                <FiDownload /> {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>

          {/* 1. Top Dashboard Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalStudents ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xl">
                  <FiUsers />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2 border-t border-slate-100 pt-2">
                Registered CBP 7.0 Participants
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment Completed</p>
                  <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{stats?.paymentCompleted ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xl">
                  <FiCreditCard />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2 border-t border-slate-100 pt-2">
                PhonePe Verified Transactions
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Payment</p>
                  <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{stats?.paymentPending ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xl">
                  <FiClock />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2 border-t border-slate-100 pt-2">
                Fee Payment Action Required
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certificate Eligible</p>
                  <h3 className="text-2xl font-extrabold text-purple-700 mt-1">{stats?.certificateEligible ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-xl">
                  <FiAward />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2 border-t border-slate-100 pt-2">
                75%+ Attendance Achieved
              </p>
            </div>
          </div>

          {/* 2. Filter & Search Control Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                  placeholder="Search Student ID, Name, Email, Phone..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              {/* Registration Status */}
              <div>
                <select
                  value={regFilter}
                  onChange={(e) => {
                    setRegFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
                >
                  <option value="ALL">Registration: All</option>
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <select
                  value={payFilter}
                  onChange={(e) => {
                    setPayFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
                >
                  <option value="ALL">Payment: All</option>
                  <option value="SUCCESS">SUCCESS (Paid)</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              {/* Attendance Status */}
              <div>
                <select
                  value={attFilter}
                  onChange={(e) => {
                    setAttFilter(e.target.value)
                    setPage(0)
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
                >
                  <option value="ALL">Attendance: All</option>
                  <option value="ELIGIBLE">Eligible (≥75%)</option>
                  <option value="NOT_ELIGIBLE">Not Eligible (&lt;75%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Student Data Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Student Directory Log
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                {selectedStudentIds.length > 0 && (
                  <span className="font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                    {selectedStudentIds.length} Selected
                  </span>
                )}
                <span>{studentsPage?.totalElements ?? 0} Total Records</span>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading student directory...</div>
            ) : !studentsPage || studentsPage.content.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No students found matching the selected query and filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.length === studentsPage.content.length && studentsPage.content.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      </th>
                      <th className="px-6 py-3">Student ID</th>
                      <th className="px-6 py-3">Name</th>
                      {columnPrefs.showEmail && <th className="px-6 py-3">Email</th>}
                      {columnPrefs.showPhone && <th className="px-6 py-3">Phone</th>}
                      {columnPrefs.showBranch && <th className="px-6 py-3">Course / Branch</th>}
                      {columnPrefs.showRegistration && <th className="px-6 py-3">Registration</th>}
                      {columnPrefs.showPayment && <th className="px-6 py-3">Payment</th>}
                      {columnPrefs.showAttendance && <th className="px-6 py-3">Attendance %</th>}
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsPage.content.map((item) => {
                      const isSelected = selectedStudentIds.includes(item.studentId)
                      const isPaid = item.paymentStatus === "SUCCESS"
                      const isEligible = item.attendancePercentage >= 75.0

                      return (
                        <tr
                          key={item.studentId}
                          onClick={() => router.push(`/admin/students/${item.studentId}`)}
                          className={`hover:bg-slate-50/80 transition cursor-pointer ${
                            isSelected ? "bg-cyan-50/30" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectStudent(item.studentId)}
                              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                            />
                          </td>

                          <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                            {item.studentId}
                          </td>

                          <td className="px-6 py-3.5 font-bold text-slate-900">
                            {item.name}
                          </td>

                          {columnPrefs.showEmail && (
                            <td className="px-6 py-3.5 font-mono text-slate-600">{item.email}</td>
                          )}

                          {columnPrefs.showPhone && (
                            <td className="px-6 py-3.5 font-mono text-slate-600">{item.phone}</td>
                          )}

                          {columnPrefs.showBranch && (
                            <td className="px-6 py-3.5 font-medium text-slate-800">
                              {item.course} - {item.branch}
                            </td>
                          )}

                          {columnPrefs.showRegistration && (
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                {item.registrationStatus}
                              </span>
                            </td>
                          )}

                          {columnPrefs.showPayment && (
                            <td className="px-6 py-3.5">
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
                          )}

                          {columnPrefs.showAttendance && (
                            <td className="px-6 py-3.5">
                              <span
                                className={`font-mono font-extrabold ${
                                  isEligible ? "text-emerald-700" : "text-slate-600"
                                }`}
                              >
                                {item.attendancePercentage.toFixed(1)}%
                              </span>
                            </td>
                          )}

                          <td className="px-6 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/admin/students/${item.studentId}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition inline-flex items-center gap-1"
                              title="View Full Profile"
                            >
                              <FiEye /> View
                            </button>
                            <button
                              onClick={() => router.push(`/admin/students/${item.studentId}`)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-cyan-200"
                              title="Edit Profile"
                            >
                              <FiEdit /> Edit
                            </button>
                            <button
                              onClick={(e) => handlePrintPdf(item.studentId, e)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-purple-200"
                              title="Print Profile PDF"
                            >
                              <FiPrinter /> Print
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Page {studentsPage.number + 1} of {Math.max(studentsPage.totalPages, 1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
                      disabled={studentsPage.first}
                      className="px-3 py-1 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition inline-flex items-center gap-1 font-bold"
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => (studentsPage.last ? p : p + 1))}
                      disabled={studentsPage.last}
                      className="px-3 py-1 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition inline-flex items-center gap-1 font-bold"
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Column Preferences Modal */}
      <ColumnCustomizerModal
        initialPrefs={columnPrefs}
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        onSave={handleSavePreferences}
      />
    </div>
  )
}
