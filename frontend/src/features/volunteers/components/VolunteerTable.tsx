"use client"

import React from "react"
import Link from "next/link"
import { VolunteerListItem, VolunteerInvitationItem } from "../types"
import { VolunteerTab } from "../hooks/useVolunteers"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import {
  FiCheck,
  FiSlash,
  FiKey,
  FiSend,
  FiInfo,
} from "react-icons/fi"

interface VolunteerTableProps {
  activeTab: VolunteerTab
  activeVolunteers: VolunteerListItem[]
  pendingInvitations: VolunteerInvitationItem[]
  loading: boolean
  search: string
  handleToggleDisable: (id: string) => void
  handleResendInvite: (id: string, e?: React.MouseEvent) => void
  handleRevokeInvite: (id: string, e?: React.MouseEvent) => void
  handleOpenDetails: (inv: VolunteerInvitationItem) => void
}

/**
 * Compact permission summary renderer: shows first 2 permissions + "+N more" badge
 */
function renderPermissionSummary(permissions?: string[]) {
  if (!permissions || permissions.length === 0) {
    return <span className="text-[11px] text-slate-400 italic">No permissions</span>
  }

  const visibleCount = 2
  const visible = permissions.slice(0, visibleCount)
  const remaining = permissions.length - visibleCount

  return (
    <div className="flex items-center gap-1 flex-wrap" title={permissions.join(", ")}>
      {visible.map((p) => (
        <span
          key={p}
          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200"
        >
          {p}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200">
          +{remaining} more
        </span>
      )}
    </div>
  )
}

export default function VolunteerTable({
  activeTab,
  activeVolunteers,
  pendingInvitations,
  loading,
  search,
  handleToggleDisable,
  handleResendInvite,
  handleRevokeInvite,
  handleOpenDetails,
}: VolunteerTableProps) {
  const filteredActive = activeVolunteers.filter((v) => {
    const q = search.toLowerCase()
    return (
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      (v.permissions && v.permissions.some((p) => p.toLowerCase().includes(q)))
    )
  })

  const filteredPending = pendingInvitations.filter((inv) => {
    const q = search.toLowerCase()
    return (
      inv.email.toLowerCase().includes(q) ||
      (inv.name && inv.name.toLowerCase().includes(q)) ||
      (inv.status && inv.status.toLowerCase().includes(q))
    )
  })

  // ==========================================
  // TAB 1: ACTIVE VOLUNTEERS
  // ==========================================
  if (activeTab === "active") {
    // Mobile Decision Card View (< 768px)
    const mobileCards = filteredActive.map((v) => {
      const isDisabled = v.status === "DISABLED"

      return (
        <MobileRecordCard
          key={v.id}
          title={v.name}
          subtitle={v.email}
          status={v.status}
          fields={[
            {
              label: "Permissions",
              value: renderPermissionSummary(v.permissions),
            },
            {
              label: "Responsibilities",
              value: v.assignedSessions?.join(", ") || "Auditorium Gate Scanner",
            },
          ]}
          actions={
            <div className="flex items-center gap-1.5 w-full justify-end">
              <Link
                href={`/admin/volunteers/${v.id}`}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
              >
                <FiKey className="text-xs text-slate-500" /> Permissions
              </Link>
              <button
                onClick={() => handleToggleDisable(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 border cursor-pointer ${
                  isDisabled
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                }`}
              >
                {isDisabled ? <FiCheck className="text-xs" /> : <FiSlash className="text-xs" />}
                <span>{isDisabled ? "Activate" : "Disable"}</span>
              </button>
            </div>
          }
        />
      )
    })

    return (
      <DataTable
        title="Active Volunteer Staff"
        totalCount={filteredActive.length}
        loading={loading}
        data={filteredActive}
        emptyMessage="No active volunteers found"
        emptySubtext="Invite volunteer staff to assign attendance scanner and operations duties."
        mobileView={mobileCards.length > 0 ? <>{mobileCards}</> : null}
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Permissions</th>
              <th className="px-4 py-2.5">Responsibilities</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {filteredActive.map((v) => {
              const isDisabled = v.status === "DISABLED"

              return (
                <tr key={v.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{v.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600 truncate max-w-[200px]">{v.email}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    {renderPermissionSummary(v.permissions)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-[11px] truncate max-w-[220px]">
                    {v.assignedSessions?.join(", ") || "Auditorium Gate Scanner"}
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-1.5">
                    <Link
                      href={`/admin/volunteers/${v.id}`}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1 shadow-2xs"
                    >
                      <FiKey className="text-slate-500 text-xs" /> Permissions
                    </Link>
                    <button
                      onClick={() => handleToggleDisable(v.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 border cursor-pointer ${
                        isDisabled
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      {isDisabled ? <FiCheck className="text-xs" /> : <FiSlash className="text-xs" />}
                      <span>{isDisabled ? "Activate" : "Disable"}</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataTable>
    )
  }

  // ==========================================
  // TAB 2: PENDING INVITATIONS
  // ==========================================
  const mobileCards = filteredPending.map((inv) => {
    return (
      <MobileRecordCard
        key={inv.id}
        title={inv.name || inv.email}
        subtitle={inv.email}
        status={inv.status}
        fields={[
          { label: "Delivery", value: inv.emailDeliveryStatus || "SENT" },
          {
            label: "Expires",
            value: inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "7 Days",
            mono: true,
          },
          {
            label: "Permissions",
            value: renderPermissionSummary(inv.permissions),
          },
        ]}
        actions={
          <div className="flex items-center gap-1.5 w-full justify-end">
            <button
              onClick={() => handleOpenDetails(inv)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <FiInfo className="text-xs text-slate-500" /> Details
            </button>
            <button
              onClick={(e) => handleResendInvite(inv.id, e)}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold inline-flex items-center gap-1 border border-cyan-200 cursor-pointer"
            >
              <FiSend className="text-xs" /> Resend
            </button>
            <button
              onClick={(e) => handleRevokeInvite(inv.id, e)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold inline-flex items-center gap-1 border border-rose-200 cursor-pointer"
            >
              <FiSlash className="text-xs" /> Revoke
            </button>
          </div>
        }
      />
    )
  })

  return (
    <DataTable
      title="Pending Invitations"
      totalCount={filteredPending.length}
      loading={loading}
      data={filteredPending}
      emptyMessage="No pending invitations found"
      emptySubtext="All invited staff have accepted or no invitations are currently active."
      mobileView={mobileCards.length > 0 ? <>{mobileCards}</> : null}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
          <tr>
            <th className="px-4 py-2.5">Invited Email</th>
            <th className="px-4 py-2.5">Candidate Name</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Delivery</th>
            <th className="px-4 py-2.5">Expiry Date</th>
            <th className="px-4 py-2.5">Permissions</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
          {filteredPending.map((inv) => {
            return (
              <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{inv.email}</td>
                <td className="px-4 py-2.5 text-slate-800">{inv.name || "—"}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={inv.emailDeliveryStatus || "SENT"} />
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                  {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "7 Days"}
                </td>
                <td className="px-4 py-2.5">
                  {renderPermissionSummary(inv.permissions)}
                </td>
                <td className="px-4 py-2.5 text-right space-x-1.5">
                  <button
                    onClick={() => handleOpenDetails(inv)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <FiInfo className="text-xs text-slate-500" /> Details
                  </button>
                  <button
                    onClick={(e) => handleResendInvite(inv.id, e)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-xs transition inline-flex items-center gap-1 border border-cyan-200 cursor-pointer"
                  >
                    <FiSend className="text-xs" /> Resend
                  </button>
                  <button
                    onClick={(e) => handleRevokeInvite(inv.id, e)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition inline-flex items-center gap-1 border border-rose-200 cursor-pointer"
                  >
                    <FiSlash className="text-xs" /> Revoke
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </DataTable>
  )
}
