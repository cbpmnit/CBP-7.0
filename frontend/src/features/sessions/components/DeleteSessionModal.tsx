"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { AttendanceSessionDto } from "../types"
import { FiAlertTriangle } from "react-icons/fi"

interface DeleteSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: AttendanceSessionDto | null
  onDeleteSession: (id: string) => Promise<void>
}

export function DeleteSessionModal({
  isOpen,
  onClose,
  session,
  onDeleteSession,
}: DeleteSessionModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!session) return null

  const handleDelete = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onDeleteSession(session.id)
      onClose()
    } catch (err: any) {
      setError(err?.message || "Failed to delete session.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Session"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
          <FiAlertTriangle className="text-amber-600 text-lg shrink-0" />
          <p>
            Are you sure you want to delete <strong>Day {session.dayNumber}: {session.title}</strong>? All associated attendance logs will be permanently deleted.
          </p>
        </div>

        {error && <Alert type="error" title="Delete Failed" message={error} />}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={submitting}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
