"use client"

import { useState, useEffect, useCallback } from "react"
import { studentApi } from "../services/studentApi"
import {
  AdminDashboardStats,
  AdminStudentListItem,
  AdminFullStudentDetail,
} from "../types"
import { PageResponse } from "@/types/attendance"

export function useStudents() {
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

  // Student Details Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentDetail, setStudentDetail] = useState<AdminFullStudentDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      const res = await studentApi.getDashboardStats()
      setStats(res)
    } catch (err) {
      console.warn("Failed to load student statistics summary", err)
    }
  }, [])

  const loadStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentApi.getStudents({
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
  }, [search, regFilter, payFilter, attFilter, page])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const handleOpenStudentProfile = async (studentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedStudentId(studentId)
    setIsDetailModalOpen(true)
    setLoadingDetail(true)
    setStudentDetail(null)

    try {
      const data = await studentApi.getStudentById(studentId)
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
      await studentApi.exportStudentsCsv({
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
      await studentApi.downloadStudentPdf(studentId)
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

  return {
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
    page,
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
    reload: loadStudents,
  }
}
