"use client"

import React, { InputHTMLAttributes, forwardRef } from "react"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
  required?: boolean
  variant?: "auth" | "dashboard"
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, required, variant = "auth", className = "", ...props }, ref) => {
    const baseInputStyle =
      variant === "dashboard"
        ? "w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none disabled:opacity-80 transition font-medium"
        : "mt-1.5 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"

    return (
      <div className="w-full">
        {label && (
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            {icon && <span className="text-cyan-600">{icon}</span>}
            <span>{label}</span>
            {required && <span className="text-cyan-600">*</span>}
          </label>
        )}
        <input ref={ref} className={`${baseInputStyle} ${className}`} {...props} />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
