"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import {
  adminStudentService,
  AdminStudentListItem,
  AdminDashboardStats,
  AdminFullStudentDetail,
} from "@/services/adminStudentService"
import { PageResponse } from "@/types/attendance"
import {
  FiUsers,
  FiCreditCard,
  FiClock,
  FiAward,
  FiSearch,
  FiDownload,
  FiEye,
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiEdit,
  FiMail,
  FiX,
  FiCalendar,
  FiMapPin,
  FiBook,
  FiDollarSign,
  FiCheckSquare,
} from "react-icons/fi"

export default function AdminStudentManagementPage() {
  const router = useRouter()

  // Data State
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [studentsPage, setStudentsPage] = useState<PageResponse<AdminStudentListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters State
  const [search, setSearch] = useState("")
  const [regFilter, setRegFilter] = useState("ALL")
  const [payFilter, setPayFilter] = useState("ALL")
  const [attFilter, setAttFilter] = useState("ALL")
  const [page, setPage] = useState(0)

  // Checkbox Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Student Details Modal / Drawer State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentDetail, setStudentDetail] = useState<AdminFullStudentDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [search, regFilter, payFilter, attFilter, page])

  const loadStats = async () => {
    try {
      const res = await adminStudentService.getDashboardStats()
      setStats(res)
    } catch (err) {
      console.warn("Failed to load student statistics summary", err)
    }
  }

  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await adminStudentService.getStudents({
        page,
        size: 20,
        search,
        registrationStatus: regFilter,
        paymentStatus: payFilter,
        attendanceStatus: attFilter,
      })
      setStudentsPage(res)
    } catch (err) {
      console.error("Failed to load students directory", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenStudentProfile = async (studentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedStudentId(studentId)
    setIsDetailModalOpen(true)
    setLoadingDetail(true)
    setStudentDetail(null)

    try {
      const data = await adminStudentService.getStudentById(studentId)
      setStudentDetail(data)
    } catch (err) {
      console.error("Failed to load complete student dossier", err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      await adminStudentService.exportStudentsCsv({
        search,
        registrationStatus: regFilter,
        paymentStatus: payFilter,
        attendanceStatus: attFilter,
      })
    } catch (err) {
      console.error("Export failed", err)
    } finally {
      setExporting(false)
    }
  }

  const handlePrintPdf = async (studentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      await adminStudentService.downloadStudentPdf(studentId)
    } catch (err) {
      console.error("PDF download failed", err)
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
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <PermissionGuard requiredPermission="STUDENT_VIEW">
            <div className="mx-auto max-w-6xl space-y-6">
            {/* Header Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <FiShield /> Unified Student Management
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Student Management <span className="gradient-text-cyan">Directory</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Search, filter, inspect complete academic dossiers, verify PhonePe fee payments, track attendance eligibility, and export student records.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <button
                  onClick={handleExportCsv}
                  disabled={exporting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 shadow-cyan-600/20 shrink-0 disabled:opacity-50"
                >
                  <FiDownload /> {exporting ? "Exporting..." : "Export CSV"}
                </button>
              </div>
            </div>

            {/* KPI Metric Summary Cards */}
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
                  PhonePe Verified Registrations
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
                  Fee Payment Incomplete
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

            {/* Filter & Search Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(0)
                    }}
                    placeholder="Search students by ID, name, email or phone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>

                {/* Payment Status Filter */}
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
                    <option value="SUCCESS">Paid (Success)</option>
                    <option value="PENDING">Pending Payment</option>
                  </select>
                </div>

                {/* Registration Status Filter */}
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
                    <option value="REGISTERED">Registered</option>
                    <option value="PENDING">Incomplete</option>
                  </select>
                </div>

                {/* Attendance Eligibility Filter */}
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
                    <option value="ELIGIBLE">Eligible for Certificate (≥75%)</option>
                    <option value="NOT_ELIGIBLE">Below Requirement (&lt;75%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Student Table */}
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
                  <p className="text-[11px] text-slate-400">There are no student records matching your current search or filter criteria.</p>
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
          </div>

          {/* DETAILED STUDENT DOSSIER MODAL / DRAWER */}
          {isDetailModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl font-bold">
                      <FiUsers />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-slate-900">
                          {studentDetail?.student.name || selectedStudentId}
                        </h2>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
                          {studentDetail?.student.studentId || selectedStudentId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {studentDetail?.student.email || "Loading dossier..."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
                  >
                    <FiX />
                  </button>
                </div>

                {loadingDetail ? (
                  <div className="py-16 text-center space-y-3 text-slate-400">
                    <FiRefreshCw className="animate-spin text-3xl mx-auto text-cyan-600" />
                    <p className="text-xs font-semibold">Loading student record & payment history...</p>
                  </div>
                ) : studentDetail ? (
                  <div className="space-y-5 text-xs text-slate-700">
                    {/* 1. Personal Information */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <FiUsers className="text-cyan-600" /> Personal Information
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                          <span className="font-bold text-slate-900">{studentDetail.student.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                          <span className="font-mono text-slate-800">{studentDetail.student.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                          <span className="font-mono text-slate-800">{studentDetail.student.phone || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                          <span className="text-slate-800">{studentDetail.profile.gender || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                          <span className="text-slate-800">{studentDetail.profile.dob || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                          <span className="text-slate-800">
                            {studentDetail.profile.city ? `${studentDetail.profile.city}, ${studentDetail.profile.state}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Academic Information */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <FiBook className="text-cyan-600" /> Academic Information
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Institute</span>
                          <span className="font-bold text-slate-900">{studentDetail.profile.institute || "MNIT Jaipur"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Course / Branch</span>
                          <span className="text-slate-800">{studentDetail.profile.course} - {studentDetail.profile.branch}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Year / Section</span>
                          <span className="text-slate-800">Year {studentDetail.profile.year} • Section {studentDetail.profile.section || "A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Residence</span>
                          <span className="text-slate-800">
                            {studentDetail.profile.hosteller ? `Hosteller (Room ${studentDetail.profile.roomNumber || "—"})` : "Day Scholar"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Registration & Payment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Registration */}
                      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                          <FiCheckSquare className="text-blue-600" /> Registration Details
                        </h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Status:</span>
                            <span className="font-bold text-blue-900">{studentDetail.registration.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Registration ID:</span>
                            <span className="font-mono text-slate-700">{studentDetail.registration.registrationId || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Registered On:</span>
                            <span className="text-slate-700">
                              {studentDetail.registration.registeredAt
                                ? new Date(studentDetail.registration.registeredAt).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <FiDollarSign className="text-emerald-600" /> Fee Payment
                        </h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Status:</span>
                            <span className="font-bold text-emerald-800">{studentDetail.payment.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Amount:</span>
                            <span className="font-bold text-slate-900">₹{studentDetail.payment.amount?.toLocaleString() || "2,500"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Transaction ID:</span>
                            <span className="font-mono text-[11px] text-slate-700">{studentDetail.payment.transactionId || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Attendance & Certification */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                        <FiAward className="text-purple-600" /> Attendance & Certificate Eligibility
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Sessions Attended</span>
                          <span className="font-extrabold text-sm text-slate-900">
                            {studentDetail.attendance.attendedSessions} / {studentDetail.attendance.totalSessions}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Attendance Rate</span>
                          <span className="font-extrabold text-sm text-purple-700">
                            {studentDetail.attendance.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Certificate Status</span>
                          <span className="font-bold text-xs text-emerald-700">
                            {studentDetail.certificate.status || (studentDetail.attendance.percentage >= 75 ? "ELIGIBLE" : "IN PROGRESS")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Could not retrieve student profile details.
                  </div>
                )}

                {/* Footer Modal Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrintPdf(selectedStudentId || "")}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition inline-flex items-center gap-1.5 border border-purple-200"
                    >
                      <FiPrinter /> Download PDF
                    </button>
                    {studentDetail?.student.email && (
                      <a
                        href={`mailto:${studentDetail.student.email}?subject=CBP%207.0%20Notification%20-%20MNIT%20Jaipur`}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition inline-flex items-center gap-1.5 border border-blue-200"
                      >
                        <FiMail /> Send Email
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/students/${selectedStudentId}`)}
                      className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold transition inline-flex items-center gap-1.5 border border-cyan-200"
                    >
                      <FiEdit /> Full Edit Mode
                    </button>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </PermissionGuard>
        </main>
      </div>
    </PageTransition>
  )
}
