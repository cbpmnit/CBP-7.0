"use client"

import { useState } from "react"
import { RecipientSelector, RecipientSelectionMode } from "./RecipientSelector"
import { StudentSelectionTable } from "./StudentSelectionTable"
import { EmailComposer } from "./EmailComposer"
import { EligibleStudentQrItem, AttendanceSessionDto } from "@/types/attendance"

interface EmailOperationsPanelProps {
  emailTemplates: any[]
  sessions: AttendanceSessionDto[]
  selectedSessionId: string
  onSessionChange: (sessionId: string) => void
}

export function EmailOperationsPanel({
  emailTemplates,
  sessions,
  selectedSessionId,
  onSessionChange,
}: EmailOperationsPanelProps) {
  const [mode, setMode] = useState<RecipientSelectionMode>("MANUAL")
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL_STUDENTS")
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<Map<string, string>>(new Map())

  const handleToggleSelectStudent = (studentId: string, email: string) => {
    const ids = new Set(selectedStudentIds)
    const emails = new Map(selectedStudentEmails)

    if (ids.has(studentId)) {
      ids.delete(studentId)
      emails.delete(studentId)
    } else {
      ids.add(studentId)
      emails.set(studentId, email)
    }

    setSelectedStudentIds(ids)
    setSelectedStudentEmails(emails)
  }

  const handleToggleSelectAll = (items: EligibleStudentQrItem[]) => {
    const ids = new Set(selectedStudentIds)
    const emails = new Map(selectedStudentEmails)
    const allSelected = items.length > 0 && items.every((i) => ids.has(i.studentId))

    if (allSelected) {
      items.forEach((i) => {
        ids.delete(i.studentId)
        emails.delete(i.studentId)
      })
    } else {
      items.forEach((i) => {
        ids.add(i.studentId)
        emails.set(i.studentId, i.email)
      })
    }

    setSelectedStudentIds(ids)
    setSelectedStudentEmails(emails)
  }

  const handleClearManualSelection = () => {
    setSelectedStudentIds(new Set())
    setSelectedStudentEmails(new Map())
  }

  const selectedEmailsList = Array.from(selectedStudentEmails.values()).filter(Boolean)

  return (
    <div className="space-y-4">
      {/* SECTION 1: RECIPIENT SELECTION */}
      <RecipientSelector
        mode={mode}
        onModeChange={(m) => setMode(m)}
        selectedGroup={selectedGroup}
        onGroupChange={(g) => setSelectedGroup(g)}
        selectedStudentCount={selectedStudentIds.size}
        onClearManualSelection={handleClearManualSelection}
      />

      {/* MODE A: STUDENT SELECTION TABLE */}
      {mode === "MANUAL" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Select Students Manually
            </h4>
            <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {selectedStudentIds.size} Student(s) Selected
            </span>
          </div>

          <StudentSelectionTable
            selectedSessionId={selectedSessionId}
            selectedStudentIds={selectedStudentIds}
            selectedStudentEmails={new Set(selectedEmailsList)}
            onToggleSelectStudent={handleToggleSelectStudent}
            onToggleSelectAll={handleToggleSelectAll}
          />
        </div>
      )}

      {/* SECTIONS 2 & 3: EMAIL CONFIGURATION & SESSION COMMUNICATION */}
      <EmailComposer
        emailTemplates={emailTemplates}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSessionChange={onSessionChange}
        recipientMode={mode}
        selectedGroup={selectedGroup}
        selectedStudentEmails={selectedEmailsList}
      />
    </div>
  )
}
