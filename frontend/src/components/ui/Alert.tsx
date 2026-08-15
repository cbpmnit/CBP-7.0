"use client"

import React from "react"
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from "react-icons/fi"

export type AlertType = "success" | "error" | "warning" | "info"

export interface AlertProps {
  type?: AlertType
  title?: string
  message: React.ReactNode
  className?: string
  onClose?: () => void
}

export function Alert({
  type = "info",
  title,
  message,
  className = "",
  onClose,
}: AlertProps) {
  const styles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <FiAlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <FiAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: "bg-cyan-50 border-cyan-200 text-cyan-900",
      icon: <FiInfo className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />,
    },
  }[type]

  return (
    <div
      className={`rounded-2xl border p-4 text-xs font-semibold flex items-start gap-3 transition ${styles.bg} ${className}`}
      role="alert"
    >
      {styles.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-extrabold uppercase tracking-wider mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold text-sm shrink-0 ml-2"
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default Alert
