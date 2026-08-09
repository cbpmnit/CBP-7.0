"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useStudents } from "../hooks/useStudents"
import StudentFilters from "./StudentFilters"
import StudentTable from "./StudentTable"
import StudentDetailModal from "./StudentDetailModal"
import {
  FiShield,
  FiDownload,
  FiUsers,
  FiCreditCard,
  FiClock,
  FiAward,
} from "react-icons/fi"

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

            {/* Professional Student Table */}
            <StudentTable
              studentsPage={studentsPage}
              loading={loading}
              selectedStudentIds={selectedStudentIds}
              toggleSelectAll={toggleSelectAll}
              toggleSelectStudent={toggleSelectStudent}
              handleOpenStudentProfile={handleOpenStudentProfile}
              setPage={setPage}
            />
          </div>

          {/* Detailed Student Modal */}
          <StudentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            studentDetail={studentDetail}
            selectedStudentId={selectedStudentId}
            loadingDetail={loadingDetail}
            handlePrintPdf={handlePrintPdf}
          />
        </PermissionGuard>
      </main>
    </PageTransition>
  )
}
