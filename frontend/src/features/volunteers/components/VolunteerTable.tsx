"use client"

import React from "react"
import Link from "next/link"
import { VolunteerListItem, VolunteerInvitationItem } from "../types"
import { VolunteerTab } from "../hooks/useVolunteers"
import {
  FiUsers,
  FiCheckCircle,
  FiSlash,
  FiCheck,
  FiEye,
  FiSend,
  FiRefreshCw,
  FiClock,
  FiAlertCircle,
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

  if (activeTab === "active") {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FiRefreshCw className="animate-spin text-2xl mx-auto text-cyan-600" />
            <p className="text-xs font-semibold">Loading active volunteer roster...</p>
          </div>
        ) : filteredActive.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FiUsers className="text-3xl mx-auto text-slate-300" />
            <h3 className="text-xs font-bold text-slate-700">No Active Volunteers Found</h3>
            <p className="text-[11px] text-slate-400">
              Invite a volunteer or check Pending Invitations to view invited members.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Volunteer Name</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned Scopes</th>
                  <th className="px-6 py-3.5">Assigned Duties</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredActive.map((v) => {
                  const isActive = v.status === "ACTIVE"
                  const isDisabled = v.status === "DISABLED"

                  return (
                    <tr key={v.id} className="hover:bg-cyan-50/30 transition">
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {v.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {v.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isActive ? <FiCheckCircle /> : <FiSlash />}
                          {v.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {v.permissions && v.permissions.length > 0 ? (
                            v.permissions.map((scope) => (
                              <span
                                key={scope}
                                className="inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-cyan-50 text-cyan-900 border border-cyan-200"
                              >
                                {scope}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No scopes assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-[11px]">
                        {v.assignedSessions?.join(", ") || "Auditorium Gate Scanner"}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/volunteers/${v.id}`}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-[11px] transition inline-flex items-center gap-1 border border-cyan-200 shadow-2xs"
                        >
                          <FiEye /> Inspect &amp; Scopes
                        </Link>
                        <button
                          onClick={() => handleToggleDisable(v.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition inline-flex items-center gap-1 border ${
                            isDisabled
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {isDisabled ? <FiCheck /> : <FiSlash />}
                          {isDisabled ? "Activate" : "Disable"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // TAB 2: PENDING INVITATIONS DIRECTORY
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <FiRefreshCw className="animate-spin text-2xl mx-auto text-cyan-600" />
          <p className="text-xs font-semibold">Loading pending onboarding invitations...</p>
        </div>
      ) : filteredPending.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-2">
          <FiClock className="text-3xl mx-auto text-slate-300" />
          <h3 className="text-xs font-bold text-slate-700">No Pending Invitations</h3>
          <p className="text-[11px] text-slate-400">All invited volunteers have completed their account setup.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5">Invited Email</th>
                <th className="px-6 py-3.5">Candidate Name</th>
                <th className="px-6 py-3.5">Token Status</th>
                <th className="px-6 py-3.5">Email Delivery</th>
                <th className="px-6 py-3.5">Expiry Date</th>
                <th className="px-6 py-3.5">Configured Scopes</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredPending.map((inv) => {
                const isFailed =
                  inv.emailDeliveryStatus === "FAILED" || inv.status === "EMAIL_FAILED"

                return (
                  <tr key={inv.id} className="hover:bg-amber-50/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {inv.email}
                    </td>

                    <td className="px-6 py-4 text-slate-800">
                      {inv.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-900 border border-amber-200">
                        <FiClock /> {inv.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          isFailed
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {isFailed ? <FiAlertCircle /> : <FiCheckCircle />}
                        {inv.emailDeliveryStatus || "SENT"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">
                      {inv.expiresAt
                        ? new Date(inv.expiresAt).toLocaleDateString()
                        : "7 Days"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {inv.permissions && inv.permissions.length > 0 ? (
                          inv.permissions.map((scope) => (
                            <span
                              key={scope}
                              className="inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {scope}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Default scanner</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetails(inv)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition inline-flex items-center gap-1 border border-slate-200 shadow-2xs"
                      >
                        <FiInfo /> View Details
                      </button>
                      <button
                        onClick={(e) => handleResendInvite(inv.id, e)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-[11px] transition inline-flex items-center gap-1 border border-cyan-200 shadow-2xs"
                      >
                        <FiSend /> Resend Email
                      </button>
                      <button
                        onClick={(e) => handleRevokeInvite(inv.id, e)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] transition inline-flex items-center gap-1 border border-rose-200"
                      >
                        <FiSlash /> Revoke
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
