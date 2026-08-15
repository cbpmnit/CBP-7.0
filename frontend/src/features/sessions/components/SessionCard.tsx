"use client"

import React from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { AttendanceSessionDto } from "../types"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiEdit2,
  FiPlay,
  FiSquare,
  FiTrash2,
  FiUsers,
  FiRefreshCw,
} from "react-icons/fi"

interface SessionCardProps {
  session: AttendanceSessionDto
  actionLoadingSessionId: string | null
  actionType: "activate" | "close" | "delete" | null
  onOpenEdit: (session: AttendanceSessionDto) => void
  onOpenDelete: (session: AttendanceSessionDto) => void
  onActivate: (id: string) => void
  onClose: (id: string) => void
}

export function SessionCard({
  session,
  actionLoadingSessionId,
  actionType,
  onOpenEdit,
  onOpenDelete,
  onActivate,
  onClose,
}: SessionCardProps) {
  const formatTime12h = (timeStr?: string | null) => {
    if (!timeStr) return "—"
    const parts = timeStr.split(":")
    if (parts.length < 2) return timeStr
    let hours = parseInt(parts[0], 10)
    const minutes = parts[1]
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    const hoursStr = hours < 10 ? `0${hours}` : hours.toString()
    return `${hoursStr}:${minutes} ${ampm}`
  }

  const isLoadingThisSession = actionLoadingSessionId === session.id

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-800">
            Day {session.dayNumber}
          </span>
          <StatusBadge status={session.status} dot={true} className="text-[10px] px-2 py-0.5" />
        </div>

        <h3 className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
          {session.title || (session as any).sessionName}
        </h3>

        {session.description && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-slate-400 shrink-0 text-xs" />
            <span className="text-slate-800 font-semibold">{session.sessionDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiClock className="text-slate-400 shrink-0 text-xs" />
            <span>
              {formatTime12h(session.startTime)} &ndash; {formatTime12h(session.endTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiMapPin className="text-slate-400 shrink-0 text-xs" />
            <span className="truncate">{session.venue || "VLTC Auditorium, MNIT Jaipur"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenEdit(session)}
            icon={<FiEdit2 className="text-[10px]" />}
          >
            Edit
          </Button>

          {session.status === "UPCOMING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActivate(session.id)}
              disabled={actionLoadingSessionId !== null}
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
              icon={
                isLoadingThisSession && actionType === "activate" ? (
                  <FiRefreshCw className="animate-spin text-[10px]" />
                ) : (
                  <FiPlay className="text-[10px]" />
                )
              }
            >
              {isLoadingThisSession && actionType === "activate" ? "Activating..." : "Activate"}
            </Button>
          )}

          {session.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClose(session.id)}
              disabled={actionLoadingSessionId !== null}
              className="text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
              icon={
                isLoadingThisSession && actionType === "close" ? (
                  <FiRefreshCw className="animate-spin text-[10px]" />
                ) : (
                  <FiSquare className="text-[10px]" />
                )
              }
            >
              {isLoadingThisSession && actionType === "close" ? "Closing..." : "Close"}
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={() => onOpenDelete(session)}
            disabled={actionLoadingSessionId !== null}
            icon={<FiTrash2 className="text-[10px]" />}
          >
            Delete
          </Button>
        </div>

        <Link href={`/admin/attendance?sessionId=${session.id}`}>
          <Button
            variant="primary"
            size="sm"
            icon={<FiUsers className="text-[10px]" />}
          >
            Attendance
          </Button>
        </Link>
      </div>
    </Card>
  )
}
