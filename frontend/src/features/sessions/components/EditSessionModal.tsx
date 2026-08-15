"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { AttendanceSessionDto, UpdateAttendanceSessionRequest } from "../types"

interface EditSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: AttendanceSessionDto | null
  onUpdateSession: (id: string, req: UpdateAttendanceSessionRequest) => Promise<void>
}

export function EditSessionModal({
  isOpen,
  onClose,
  session,
  onUpdateSession,
}: EditSessionModalProps) {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [date, setDate] = useState("")
  const [start, setStart] = useState("09:30")
  const [end, setEnd] = useState("16:30")
  const [venue, setVenue] = useState("")
  const [status, setStatus] = useState<string>("UPCOMING")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      setTitle(session.title || "")
      setDesc(session.description || "")
      setDate(session.sessionDate || "")
      setStart(session.startTime ? session.startTime.substring(0, 5) : "09:30")
      setEnd(session.endTime ? session.endTime.substring(0, 5) : "16:30")
      setVenue(session.venue || "VLTC Auditorium, MNIT Jaipur")
      setStatus(session.status || "UPCOMING")
      setError(null)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !title.trim() || !date) {
      setError("Please enter session title and date.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onUpdateSession(session.id, {
        dayNumber: session.dayNumber,
        title: title.trim(),
        description: desc.trim() || undefined,
        sessionDate: date,
        startTime: start ? `${start}:00` : undefined,
        endTime: end ? `${end}:00` : undefined,
        venue: venue.trim() || undefined,
        status: status as any,
      })
      onClose()
    } catch (err: any) {
      setError(err?.message || "Failed to update session.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Workshop Session"
      description={session ? `Updating Session Day ${session.dayNumber}` : undefined}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" title="Update Error" message={error} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Session Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "UPCOMING", label: "Upcoming" },
              { value: "ACTIVE", label: "Active" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
        </div>

        <Input
          label="Session Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Time"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <Input
            label="End Time"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <Input
          label="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
