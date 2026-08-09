import React from "react"
import { FiSearch, FiX, FiFilter } from "react-icons/fi"

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  id: string
  label?: string
  value: string
  onChange: (val: string) => void
  options: FilterOption[]
  className?: string
}

export interface FilterBarProps {
  search?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  activeCount?: number
  onResetFilters?: () => void
  children?: React.ReactNode
  className?: string
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [],
  activeCount,
  onResetFilters,
  children,
  className = "",
}: FilterBarProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5 ${className}`}
    >
      {/* Search Input */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <FiX className="text-xs" />
            </button>
          )}
        </div>
      )}

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <select
            key={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            aria-label={filter.label || filter.id}
            className={`px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:bg-white focus:outline-none focus:border-cyan-600 cursor-pointer ${
              filter.className || ""
            }`}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {children}

        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition inline-flex items-center gap-1"
          >
            <FiFilter className="text-xs" /> Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterBar
