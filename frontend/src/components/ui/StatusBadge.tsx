import React from "react"

export type StatusType =
  | "SUCCESS"
  | "PAID"
  | "ACTIVE"
  | "PRESENT"
  | "VERIFIED"
  | "GENERATED"
  | "PENDING"
  | "UNVERIFIED"
  | "UPCOMING"
  | "FAILED"
  | "DISABLED"
  | "ABSENT"
  | "REVOKED"
  | "REGISTERED"
  | "CLOSED"
  | "SENT"
  | string

export interface StatusBadgeProps {
  status: StatusType
  label?: string
  dot?: boolean
  className?: string
}

export function StatusBadge({
  status,
  label,
  dot = true,
  className = "",
}: StatusBadgeProps) {
  const norm = (status || "").toUpperCase()

  let style = "bg-slate-100 text-slate-700 border-slate-200"
  let dotColor = "bg-slate-400"

  if (["SUCCESS", "PAID", "ACTIVE", "PRESENT", "VERIFIED", "GENERATED", "COMPLETED"].includes(norm)) {
    style = "bg-emerald-50 text-emerald-800 border-emerald-200"
    dotColor = "bg-emerald-500"
  } else if (["PENDING", "UNVERIFIED", "UPCOMING", "ACTION_REQUIRED"].includes(norm)) {
    style = "bg-amber-50 text-amber-800 border-amber-200"
    dotColor = "bg-amber-500"
  } else if (["FAILED", "DISABLED", "ABSENT", "REVOKED", "EMAIL_FAILED", "REJECTED"].includes(norm)) {
    style = "bg-rose-50 text-rose-800 border-rose-200"
    dotColor = "bg-rose-500"
  } else if (["REGISTERED", "SENT", "SCHEDULED"].includes(norm)) {
    style = "bg-blue-50 text-blue-800 border-blue-200"
    dotColor = "bg-blue-500"
  } else if (["CERTIFICATE", "MERIT"].includes(norm)) {
    style = "bg-purple-50 text-purple-800 border-purple-200"
    dotColor = "bg-purple-500"
  }

  const displayLabel = label || status

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider border ${style} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="truncate">{displayLabel}</span>
    </span>
  )
}

export default StatusBadge
