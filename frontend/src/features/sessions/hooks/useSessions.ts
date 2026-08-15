"use client"

import { useState, useEffect, useCallback } from "react"
import { sessionApi } from "../services/sessionApi"
import { AttendanceSessionDto } from "../types"
import { apiClient } from "@/lib/apiClient"

export interface CreateSessionPayload {
  dayNumber: number
  title: string
  description?: string
  sessionDate: string
  startTime?: string
  endTime?: string
  venue?: string
}

export function useSessions() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [actionLoadingSessionId, setActionLoadingSessionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"activate" | "close" | "delete" | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSession, setEditingSession] = useState<AttendanceSessionDto | null>(null)

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingSession, setDeletingSession] = useState<AttendanceSessionDto | null>(null)

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    setError(null)
    try {
      const data = await sessionApi.getAllSessions()
      setSessions(data || [])
    } catch (err: any) {
      console.error("Failed to load attendance sessions", err)
      setError("Unable to load sessions list.")
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleActivateSession = async (sessionId: string) => {
    setActionLoadingSessionId(sessionId)
    setActionType("activate")
    setMessage(null)
    setError(null)
    try {
      await sessionApi.activateSession(sessionId)
      setMessage("Session activated successfully. Check-in is now open.")
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to activate session", err)
      setError(err?.message || "Failed to activate session.")
    } finally {
      setActionLoadingSessionId(null)
      setActionType(null)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    setActionLoadingSessionId(sessionId)
    setActionType("close")
    setMessage(null)
    setError(null)
    try {
      await sessionApi.closeSession(sessionId)
      setMessage("Session closed successfully. Check-in is now locked.")
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to close session", err)
      setError(err?.message || "Failed to close session.")
    } finally {
      setActionLoadingSessionId(null)
      setActionType(null)
    }
  }

  const handleCreateSession = async (payload: CreateSessionPayload) => {
    setModalLoading(true)
    setMessage(null)
    setError(null)
    try {
      await apiClient.post("/api/v1/admin/attendance/sessions", payload)
      setMessage("New session created successfully.")
      setShowCreateModal(false)
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to create session", err)
      setError(err?.message || "Failed to create new session.")
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdateSession = async (sessionId: string, payload: Partial<CreateSessionPayload>) => {
    setModalLoading(true)
    setMessage(null)
    setError(null)
    try {
      await sessionApi.updateSession(sessionId, payload)
      setMessage("Session details updated successfully.")
      setShowEditModal(false)
      setEditingSession(null)
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to update session", err)
      setError(err?.message || "Failed to update session details.")
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!deletingSession) return
    setModalLoading(true)
    setMessage(null)
    setError(null)
    try {
      await sessionApi.deleteSession(deletingSession.id)
      setMessage("Session deleted successfully.")
      setShowDeleteModal(false)
      setDeletingSession(null)
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to delete session", err)
      setError(err?.message || "Failed to delete session.")
    } finally {
      setModalLoading(false)
    }
  }

  const openEditModal = (session: AttendanceSessionDto) => {
    setEditingSession(session)
    setShowEditModal(true)
  }

  const openDeleteModal = (session: AttendanceSessionDto) => {
    setDeletingSession(session)
    setShowDeleteModal(true)
  }

  return {
    sessions,
    loadingSessions,
    actionLoadingSessionId,
    actionType,
    modalLoading,
    message,
    error,
    showEditModal,
    setShowEditModal,
    editingSession,
    showDeleteModal,
    setShowDeleteModal,
    deletingSession,
    showCreateModal,
    setShowCreateModal,
    fetchSessions,
    handleActivateSession,
    handleCloseSession,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    openEditModal,
    openDeleteModal,
    closeEditModal: () => {
      setShowEditModal(false)
      setEditingSession(null)
    },
    closeDeleteModal: () => {
      setShowDeleteModal(false)
      setDeletingSession(null)
    },
    reload: fetchSessions,
  }
}
