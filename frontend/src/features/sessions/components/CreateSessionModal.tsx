"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { CreateAttendanceSessionRequest } from "../types"

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  defaultDayNumber: number
  onCreateSession: (req: CreateAttendanceSessionRequest) => Promise<void>
}

export function CreateSessionModal({
  isOpen,
  onClose,
  defaultDayNumber,
  onCreateSession,
}: CreateSessionModalProps) {
  const [dayNum, setDayNum] = useState(defaultDayNumber)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [date, setDate] = useState("")
  const [start, setStart] = useState("09:30")
  const [end, setEnd] = useState("16:30")
  const [venue, setVenue] = useState("VLTC Auditorium, MNIT Jaipur")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) {
      setError("Please enter a session title and date.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onCreateSession({
        dayNumber: Number(dayNum),
        title: title.trim(),
        description: desc.trim() || undefined,
        sessionDate: date,
        startTime: start ? `${start}:00` : undefined,
        endTime: end ? `${end}:00` : undefined,
        venue: venue.trim() || undefined,
      })
      setTitle("")
      setDesc("")
      onClose()
    } catch (err: any) {
      setError(err?.message || "Failed to create session.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workshop Session"
      description="Add a new session day to the CBP schedule."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" title="Creation Error" message={error} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Day Number"
            type="number"
            value={dayNum}
            onChange={(e) => setDayNum(Number(e.target.value))}
            min={1}
            required
          />
          <Input
            label="Session Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <Input
          label="Session Title"
          placeholder="e.g. Day 1: Introduction to Tech & Leadership"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Brief description of topics covered"
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
          placeholder="e.g. VLTC Auditorium"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Create Session
          </Button>
        </div>
      </form>
    </Modal>
  )
}
