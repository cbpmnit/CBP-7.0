"use client"

import React from "react"
import { FiUsers, FiClock, FiSearch, FiX } from "react-icons/fi"
import { VolunteerTab } from "../hooks/useVolunteers"

interface VolunteerFiltersProps {
  activeTab: VolunteerTab
  setActiveTab: (tab: VolunteerTab) => void
  activeCount: number
  pendingCount: number
  search: string
  setSearch: (val: string) => void
}

export default function VolunteerFilters({
  activeTab,
  setActiveTab,
  activeCount,
  pendingCount,
  search,
  setSearch,
}: VolunteerFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      {/* Compact Tab Switcher */}
      <div className="bg-slate-100 p-0.5 rounded-lg inline-flex items-center gap-1 self-start sm:self-auto">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === "active"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FiUsers className="text-xs" />
          <span>Active Volunteers</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
              activeTab === "active" ? "bg-slate-100 text-slate-900" : "text-slate-500"
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === "pending"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FiClock className="text-xs" />
          <span>Pending Invitations</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
              activeTab === "pending" ? "bg-amber-100 text-amber-900" : "text-slate-500"
            }`}
          >
            {pendingCount}
          </span>
        </button>
      </div>

      {/* Aligned Search Box */}
      <div className="relative w-full sm:w-64">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            activeTab === "active"
              ? "Search by name or email..."
              : "Search invitations..."
          }
          className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <FiX className="text-xs" />
          </button>
        )}
      </div>
    </div>
  )
}
