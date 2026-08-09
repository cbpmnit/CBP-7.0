"use client"

import { useState, useEffect, useCallback } from "react"
import { studentApi } from "../services/studentApi"
import { AdminFullStudentDetail, UpdateStudentProfilePayload } from "../types"

export function useStudentDetail(studentId: string) {
  const [studentData, setStudentData] = useState<AdminFullStudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchStudentDetail = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const data = await studentApi.getStudentById(studentId)
      setStudentData(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load student details")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchStudentDetail()
  }, [fetchStudentDetail])

  const updateProfile = async (payload: UpdateStudentProfilePayload) => {
    if (!studentId) return
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await studentApi.updateStudentProfile(studentId, payload)
      setStudentData(updated)
      setSuccessMessage("Student profile updated successfully!")
    } catch (err: any) {
      setError(err?.message || "Failed to update student profile")
    } finally {
      setSaving(false)
    }
  }

  const downloadPdf = async () => {
    if (!studentId) return
    try {
      await studentApi.downloadStudentPdf(studentId)
    } catch (err: any) {
      setError(err?.message || "Failed to download PDF dossier")
    }
  }

  return {
    studentData,
    loading,
    saving,
    error,
    successMessage,
    updateProfile,
    downloadPdf,
    reload: fetchStudentDetail,
  }
}
