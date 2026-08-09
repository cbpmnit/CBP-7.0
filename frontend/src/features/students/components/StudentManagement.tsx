"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useStudents } from "../hooks/useStudents"
import StudentFilters from "./StudentFilters"
import StudentTable from "./StudentTable"
import StudentDetailModal from "./StudentDetailModal"
import { PageHeader } from "@/components/ui/PageHeader"
import { FiDownload } from "react-icons/fi"

export default function StudentManagement() {
  const {
    stats,
    studentsPage,
    loading,
    exporting,
    search,
    setSearch,
    regFilter,
    setRegFilter,
    payFilter,
    setPayFilter,
    attFilter,
    setAttFilter,
    setPage,
    selectedStudentIds,
    toggleSelectAll,
    toggleSelectStudent,
    selectedStudentId,
    studentDetail,
    loadingDetail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    handleOpenStudentProfile,
    handleExportCsv,
    handlePrintPdf,
  } = useStudents()

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="STUDENT_VIEW">
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
            title="Student Directory"
            count={stats?.totalStudents ?? studentsPage?.totalElements ?? 0}
            countLabel="registered"
            subtitle="Directory and dossiers of registered participants"
            actions={
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <FiDownload className="text-xs" /> {exporting ? "Exporting..." : "Export CSV"}
              </button>
            }
          />

          {/* KPI Metric Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{stats?.totalStudents ?? 0}</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid Fee</p>
              <h3 className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{stats?.paidStudents ?? 0}</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Fee</p>
              <h3 className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">{stats?.pendingPaymentStudents ?? 0}</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eligible (75%+)</p>
              <h3 className="text-xl font-extrabold text-cyan-800 font-mono mt-0.5">{stats?.eligibleForCertificateStudents ?? 0}</h3>
            </div>
          </div>

          {/* Filter Search Bar */}
          <StudentFilters
            search={search}
            setSearch={setSearch}
            regFilter={regFilter}
            setRegFilter={setRegFilter}
            payFilter={payFilter}
            setPayFilter={setPayFilter}
            attFilter={attFilter}
            setAttFilter={setAttFilter}
            setPage={setPage}
          />

          {/* Student Table */}
          <StudentTable
            studentsPage={studentsPage}
            loading={loading}
            selectedStudentIds={selectedStudentIds}
            toggleSelectAll={toggleSelectAll}
            toggleSelectStudent={toggleSelectStudent}
            handleOpenStudentProfile={handleOpenStudentProfile}
            setPage={setPage}
          />

          {/* Student Detail Slide-over / Modal */}
          <StudentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            studentDetail={studentDetail}
            selectedStudentId={selectedStudentId}
            loadingDetail={loadingDetail}
            handlePrintPdf={handlePrintPdf}
          />
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
