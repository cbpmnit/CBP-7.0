"use client"

import { useState, useEffect, useCallback } from "react"
import { sessionApi } from "../services/sessionApi"
import { adminService, CreateSessionPayload } from "@/services/adminService"
import { AttendanceSessionDto } from "../types"

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

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingSession, setDeletingSession] = useState<AttendanceSessionDto | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const data = await sessionApi.getAllSessions()
      setSessions(data || [])
    } catch (err: any) {
      console.error("Failed to load sessions", err)
      setError(err?.message || "Failed to load workshop sessions.")
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleActivateSession = async (sessionId: string) => {
    // Prevent duplicate clicks
    if (actionLoadingSessionId) return

    setActionLoadingSessionId(sessionId)
    setActionType("activate")
    setError(null)

    try {
      await adminService.activateSession(sessionId)
      setMessage("Session activated successfully. Check-in is now open.")
      setTimeout(() => setMessage(null), 3500)
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to activate session", err)
      setError(err?.message || "Failed to activate session.")
      setTimeout(() => setError(null), 4000)
    } finally {
      setActionLoadingSessionId(null)
      setActionType(null)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    // Prevent duplicate clicks
    if (actionLoadingSessionId) return

    setActionLoadingSessionId(sessionId)
    setActionType("close")
    setError(null)

    try {
      await adminService.closeSession(sessionId)
      setMessage("Session closed successfully. Active QR check-in has been deactivated.")
      setTimeout(() => setMessage(null), 3500)
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to close session", err)
      setError(err?.message || "Failed to close session.")
      setTimeout(() => setError(null), 4000)
    } finally {
      setActionLoadingSessionId(null)
      setActionType(null)
    }
  }

  const handleCreateSession = async (payload: CreateSessionPayload) => {
    setModalLoading(true)
    setError(null)
    try {
      await adminService.createSession(payload)
      setMessage("New workshop session created successfully.")
      setTimeout(() => setMessage(null), 3500)
      setShowCreateModal(false)
      await fetchSessions()
    } catch (err: any) {
      setError(err?.message || "Failed to create session.")
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdateSession = async (sessionId: string, payload: any) => {
    setModalLoading(true)
    setError(null)
    try {
      await adminService.updateSession(sessionId, payload)
      setMessage("Session details updated successfully.")
      setTimeout(() => setMessage(null), 3500)
      setShowEditModal(false)
      setEditingSession(null)
      await fetchSessions()
    } catch (err: any) {
      setError(err?.message || "Failed to update session.")
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  const openEditModal = (session: AttendanceSessionDto) => {
    setEditingSession(session)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setEditingSession(null)
    setShowEditModal(false)
  }

  const openDeleteModal = (session: AttendanceSessionDto) => {
    setDeletingSession(session)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setDeletingSession(null)
    setShowDeleteModal(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    setModalLoading(true)
    setError(null)
    try {
      await adminService.deleteSession(sessionId)
      setMessage("Session and all connected records deleted successfully.")
      setTimeout(() => setMessage(null), 3500)
      setShowDeleteModal(false)
      setDeletingSession(null)
      await fetchSessions()
    } catch (err: any) {
      console.error("Failed to delete session", err)
      setError(err?.message || "Failed to delete session.")
      throw err
    } finally {
      setModalLoading(false)
    }
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
    editingSession,
    showCreateModal,
    setShowCreateModal,
    showDeleteModal,
    deletingSession,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleActivateSession,
    handleCloseSession,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    reload: fetchSessions,
  }
}
