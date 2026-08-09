"use client"

import React from "react"
import { FilterBar } from "@/components/ui/FilterBar"

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
  const filters = [
    {
      id: "payFilter",
      value: payFilter,
      onChange: (val: string) => {
        setPayFilter(val)
        setPage(0)
      },
      options: [
        { label: "Payment: All", value: "ALL" },
        { label: "Fee Paid", value: "SUCCESS" },
        { label: "Fee Pending", value: "PENDING" },
      ],
    },
    {
      id: "regFilter",
      value: regFilter,
      onChange: (val: string) => {
        setRegFilter(val)
        setPage(0)
      },
      options: [
        { label: "Registration: All", value: "ALL" },
        { label: "Registered", value: "REGISTERED" },
        { label: "Incomplete", value: "PENDING" },
      ],
    },
    {
      id: "attFilter",
      value: attFilter,
      onChange: (val: string) => {
        setAttFilter(val)
        setPage(0)
      },
      options: [
        { label: "Attendance: All", value: "ALL" },
        { label: "Eligible (≥75%)", value: "ELIGIBLE" },
        { label: "Below ( <75%)", value: "NOT_ELIGIBLE" },
      ],
    },
  ]

  const hasActiveFilters =
    search.trim() !== "" || regFilter !== "ALL" || payFilter !== "ALL" || attFilter !== "ALL"

  const handleReset = () => {
    setSearch("")
    setRegFilter("ALL")
    setPayFilter("ALL")
    setAttFilter("ALL")
    setPage(0)
  }

  return (
    <FilterBar
      search={search}
      onSearchChange={(val) => {
        setSearch(val)
        setPage(0)
      }}
      searchPlaceholder="Search by ID, name, email or phone..."
      filters={filters}
      onResetFilters={hasActiveFilters ? handleReset : undefined}
    />
  )
}
