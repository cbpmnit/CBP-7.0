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

  let displayLabel = label || status
  if (!label && typeof status === "string") {
    const rawVal = status.toUpperCase();
    if (rawVal === "ACTIVE") displayLabel = "Active";
    else if (rawVal === "SUCCESS") displayLabel = "Success";
    else if (rawVal === "PENDING") displayLabel = "Pending";
    else if (rawVal === "PRESENT") displayLabel = "Present";
    else if (rawVal === "ABSENT") displayLabel = "Absent";
    else if (rawVal === "PAID") displayLabel = "Paid";
    else if (rawVal === "VERIFIED") displayLabel = "Verified";
    else if (rawVal === "GENERATED") displayLabel = "Generated";
    else if (rawVal === "UNVERIFIED") displayLabel = "Unverified";
    else if (rawVal === "UPCOMING") displayLabel = "Upcoming";
    else if (rawVal === "FAILED") displayLabel = "Failed";
    else if (rawVal === "DISABLED") displayLabel = "Disabled";
    else if (rawVal === "REVOKED") displayLabel = "Revoked";
    else if (rawVal === "REGISTERED") displayLabel = "Registered";
    else if (rawVal === "CLOSED") displayLabel = "Closed";
    else if (rawVal === "SENT") displayLabel = "Sent";
    else if (rawVal === "SCHEDULED") displayLabel = "Scheduled";
    else if (rawVal === "COMPLETED") displayLabel = "Completed";
    else if (rawVal === "REJECTED") displayLabel = "Rejected";
    else if (rawVal === "ACTION_REQUIRED") displayLabel = "Action Required";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider border ${style} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="truncate">{displayLabel}</span>
    </span>
  )
}

export default StatusBadge
