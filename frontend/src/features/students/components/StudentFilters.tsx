"use client"

import React from "react"
import { FiSearch } from "react-icons/fi"

interface StudentFiltersProps {
  search: string
  setSearch: (val: string) => void
  regFilter: string
  setRegFilter: (val: string) => void
  payFilter: string
  setPayFilter: (val: string) => void
  attFilter: string
  setAttFilter: (val: string) => void
  setPage: (page: number) => void
}

export default function StudentFilters({
  search,
  setSearch,
  regFilter,
  setRegFilter,
  payFilter,
  setPayFilter,
  attFilter,
  setAttFilter,
  setPage,
}: StudentFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Search students by ID, name, email or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
          />
        </div>

        {/* Payment Status Filter */}
        <div>
          <select
            value={payFilter}
            onChange={(e) => {
              setPayFilter(e.target.value)
              setPage(0)
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
          >
            <option value="ALL">Payment: All</option>
            <option value="SUCCESS">Paid (Success)</option>
            <option value="PENDING">Pending Payment</option>
          </select>
        </div>

        {/* Registration Status Filter */}
        <div>
          <select
            value={regFilter}
            onChange={(e) => {
              setRegFilter(e.target.value)
              setPage(0)
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
          >
            <option value="ALL">Registration: All</option>
            <option value="REGISTERED">Registered</option>
            <option value="PENDING">Incomplete</option>
          </select>
        </div>

        {/* Attendance Eligibility Filter */}
        <div>
          <select
            value={attFilter}
            onChange={(e) => {
              setAttFilter(e.target.value)
              setPage(0)
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
          >
            <option value="ALL">Attendance: All</option>
            <option value="ELIGIBLE">Eligible for Certificate (≥75%)</option>
            <option value="NOT_ELIGIBLE">Below Requirement (&lt;75%)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
