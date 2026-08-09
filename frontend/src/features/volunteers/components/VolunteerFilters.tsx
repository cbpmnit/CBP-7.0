"use client"

import React from "react"
import { FiUsers, FiClock, FiSearch } from "react-icons/fi"
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1 self-start">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "active"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-600/20"
              : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50/50"
          }`}
        >
          <FiUsers className="text-sm" />
          <span>Active Volunteers</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "active" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "pending"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-600/20"
              : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50/50"
          }`}
        >
          <FiClock className="text-sm" />
          <span>Pending Invitations</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "pending" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
            }`}
          >
            {pendingCount}
          </span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative w-full sm:w-72">
        <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            activeTab === "active"
              ? "Search active volunteer..."
              : "Search pending invitation..."
          }
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 shadow-sm"
        />
      </div>
    </div>
  )
}
