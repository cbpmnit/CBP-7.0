"use client"

import { useState, useEffect, useCallback } from "react"
import { sessionApi } from "../services/sessionApi"
import { AttendanceSessionDto, QrGenerationStatusResponse } from "../types"

export function useSessions() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [qrStatus, setQrStatus] = useState<QrGenerationStatusResponse | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const data = await sessionApi.getAllSessions()
      setSessions(data || [])
      if (data && data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id)
      }
    } catch (err) {
      console.error("Failed to load sessions", err)
    } finally {
      setLoadingSessions(false)
    }
  }, [selectedSessionId])

  const fetchQrStatus = useCallback(async (sessionId: string) => {
    setLoadingStatus(true)
    try {
      const res = await sessionApi.getQrGenerationStatus(sessionId)
      setQrStatus(res)
    } catch (err) {
      console.warn("Failed to load QR generation status", err)
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    if (selectedSessionId) {
      fetchQrStatus(selectedSessionId)
    }
  }, [selectedSessionId, fetchQrStatus])

  const handleGenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const res = await sessionApi.generateStudentQrsForSession(selectedSessionId)
      const count = res.generatedCount ?? res.generated ?? res.totalStudents ?? 0
      setMessage(`Successfully generated student QR passes for all ${count} registered students!`)
      await fetchQrStatus(selectedSessionId)
    } catch (err: any) {
      setError(err?.message || "Failed to generate student QR passes.")
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    if (!confirm("Are you sure you want to regenerate QR passes? This will invalidate all previous QR tokens for this session.")) {
      return
    }
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const res = await sessionApi.generateStudentQrsForSession(selectedSessionId)
      const count = res.generatedCount ?? res.generated ?? res.totalStudents ?? 0
      setMessage(`Successfully regenerated and issued fresh QR passes for all ${count} registered students. Previous tokens invalidated.`)
      await fetchQrStatus(selectedSessionId)
    } catch (err: any) {
      setError(err?.message || "Failed to regenerate student QR passes.")
    } finally {
      setGenerating(false)
    }
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return {
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    selectedSession,
    qrStatus,
    loadingSessions,
    loadingStatus,
    generating,
    message,
    error,
    handleGenerateStudentQrs,
    handleRegenerateStudentQrs,
    reload: fetchSessions,
  }
}
