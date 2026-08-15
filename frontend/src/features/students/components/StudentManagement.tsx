"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useStudents } from "../hooks/useStudents"
import StudentFilters from "./StudentFilters"
import StudentTable from "./StudentTable"
import StudentDetailModal from "./StudentDetailModal"
import { PageHeader } from "@/components/ui/PageHeader"
import { MetricCard } from "@/components/ui/MetricCard"
import { Button } from "@/components/ui/Button"
import { FiDownload, FiUsers, FiCheckCircle, FiClock, FiAward } from "react-icons/fi"

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
          <PageHeader
            title="Student Directory"
            count={stats?.totalStudents ?? studentsPage?.totalElements ?? 0}
            countLabel="registered"
            subtitle="Directory and dossiers of registered participants"
            actions={
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCsv}
                loading={exporting}
                icon={<FiDownload className="text-xs" />}
              >
                Export CSV
              </Button>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <MetricCard
              title="Total Enrolled"
              value={stats?.totalStudents ?? 0}
              icon={<FiUsers className="w-5 h-5 text-cyan-600" />}
            />
            <MetricCard
              title="Paid Fee"
              value={stats?.paidStudents ?? 0}
              icon={<FiCheckCircle className="w-5 h-5 text-emerald-600" />}
            />
            <MetricCard
              title="Pending Fee"
              value={stats?.pendingPaymentStudents ?? 0}
              icon={<FiClock className="w-5 h-5 text-amber-600" />}
            />
            <MetricCard
              title="Eligible (75%+)"
              value={stats?.eligibleForCertificateStudents ?? 0}
              icon={<FiAward className="w-5 h-5 text-indigo-600" />}
            />
          </div>

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

          <StudentTable
            studentsPage={studentsPage}
            loading={loading}
            selectedStudentIds={selectedStudentIds}
            toggleSelectAll={toggleSelectAll}
            toggleSelectStudent={toggleSelectStudent}
            handleOpenStudentProfile={handleOpenStudentProfile}
            setPage={setPage}
          />

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
