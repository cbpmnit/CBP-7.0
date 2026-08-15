"use client"

import React, { SelectHTMLAttributes, forwardRef } from "react"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
  required?: boolean
  options?: SelectOption[] | string[]
  className?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, icon, error, required, options = [], className = "", children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {icon && <span className="text-cyan-600">{icon}</span>}
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium disabled:opacity-50 transition cursor-pointer ${className}`}
          {...props}
        >
          {children
            ? children
            : options.map((opt) => {
                const val = typeof opt === "string" ? opt : opt.value
                const lbl = typeof opt === "string" ? opt.replace(/_/g, " ") : opt.label
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                )
              })}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    )
  }
)

Select.displayName = "Select"
export default Select
