"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import {
  adminVolunteerService,
  VolunteerListItem,
  ALL_PERMISSION_SCOPES,
  CreateVolunteerPayload,
} from "@/services/adminVolunteerService"
import {
  FiUsers,
  FiUserPlus,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiSend,
  FiSlash,
  FiCheck,
  FiX,
  FiSearch,
  FiArrowLeft,
  FiCalendar,
  FiActivity,
} from "react-icons/fi"

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "ATTENDANCE_SCAN",
    "ATTENDANCE_VIEW",
  ])
  const [inviting, setInviting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminVolunteerService.getAllVolunteers()
      setVolunteers(data || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load volunteer roster.")
    } finally {
      setLoading(false)
    }
  }

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    )
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    setActionMessage(null)
    try {
      const payload: CreateVolunteerPayload = {
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        permissions: selectedScopes,
      }
      await adminVolunteerService.createVolunteer(payload)
      setActionMessage(`Volunteer invitation sent successfully to ${inviteEmail} ✓`)
      setIsInviteModalOpen(false)
      setInviteEmail("")
      setInviteName("")
      fetchVolunteers()
    } catch (err: any) {
      setError(err?.message || "Failed to send volunteer invitation.")
    } finally {
      setInviting(false)
    }
  }

  const handleToggleDisable = async (id: string) => {
    try {
      await adminVolunteerService.disableVolunteer(id)
      setActionMessage("Volunteer status updated successfully ✓")
      fetchVolunteers()
    } catch (err: any) {
      setError(err?.message || "Failed to update status.")
    }
  }

  const handleResend = async (id: string) => {
    try {
      const msg = await adminVolunteerService.resendInvitation(id)
      setActionMessage(msg)
    } catch (err: any) {
      setError(err?.message || "Failed to resend invitation.")
    }
  }

  const filteredVolunteers = volunteers.filter((v) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
  })

  // Group permission scopes by category for modal
  const scopeCategories = Array.from(new Set(ALL_PERMISSION_SCOPES.map((s) => s.category)))

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                <FiArrowLeft /> Back to Admin Dashboard
              </Link>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
                Permission Scopes & Role Control
              </span>
            </div>

            {/* Header Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <FiShield /> RBAC Scope Authorization
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Volunteer Operations <span className="gradient-text-cyan">Roster</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Manage volunteer team accounts, assign fine-grained permission scopes, and provision gate access.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 shadow-sm shadow-cyan-600/20"
                >
                  <FiUserPlus className="text-base" /> Invite New Volunteer
                </button>
              </div>
            </div>

            {/* Action Feedback Banners */}
            {actionMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                <FiAlertCircle className="text-rose-600 text-base shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Search & Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search volunteer by name or email..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Total Roster: <strong className="text-slate-900">{filteredVolunteers.length}</strong></span>
              </div>
            </div>

            {/* Volunteers Directory Data Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <FiRefreshCw className="animate-spin text-2xl mx-auto text-cyan-600" />
                  <p className="text-xs font-semibold">Loading volunteer team roster...</p>
                </div>
              ) : filteredVolunteers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <FiUsers className="text-3xl mx-auto text-slate-300" />
                  <h3 className="text-xs font-bold text-slate-700">No Volunteer Accounts Found</h3>
                  <p className="text-[11px] text-slate-400">Click &quot;Invite New Volunteer&quot; to provision access.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3.5">Volunteer Name</th>
                        <th className="px-6 py-3.5">Email Address</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Assigned Permission Scopes</th>
                        <th className="px-6 py-3.5">Assigned Duties</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredVolunteers.map((v) => {
                        const isInvited = v.status === "INVITED" || v.status === "PENDING"
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
                                    : isInvited
                                    ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {isActive && <FiCheckCircle />}
                                {isInvited && <FiActivity />}
                                {isDisabled && <FiSlash />}
                                {v.status}
                              </span>
                            </td>

                            {/* Assigned Permission Scope Chips */}
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

                            {/* Actions Column */}
                            <td className="px-6 py-4 text-right space-x-1.5">
                              <Link
                                href={`/admin/volunteers/${v.id}`}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition inline-flex items-center gap-1"
                                title="View & Edit Volunteer Profile"
                              >
                                <FiEye /> View Profile
                              </Link>
                              <Link
                                href={`/admin/volunteers/${v.id}`}
                                className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-cyan-200"
                                title="Manage Permission Scopes"
                              >
                                <FiEdit /> Scopes
                              </Link>
                              {isInvited && (
                                <button
                                  onClick={() => handleResend(v.id)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-purple-200"
                                  title="Resend Invitation Email"
                                >
                                  <FiSend /> Resend
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleDisable(v.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 border ${
                                  isDisabled
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                                }`}
                                title={isDisabled ? "Enable Volunteer Account" : "Disable Volunteer Account"}
                              >
                                {isDisabled ? <FiCheck /> : <FiSlash />}
                                <span>{isDisabled ? "Enable" : "Disable"}</span>
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
          </div>
        </main>

        {/* INVITE VOLUNTEER MODAL */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-lg">
                    <FiUserPlus />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Invite New Volunteer</h3>
                    <p className="text-[11px] text-slate-500">Provision account and assign scope-based permissions.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Volunteer Email Address <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="volunteer@mnit.ac.in"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Volunteer Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                </div>

                {/* Permission Scope Checkboxes Grouped by Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Assign Permission Scopes
                  </label>
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    {scopeCategories.map((cat) => (
                      <div key={cat} className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-cyan-800 tracking-wider">
                          {cat} Permissions
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ALL_PERMISSION_SCOPES.filter((s) => s.category === cat).map((scope) => {
                            const isChecked = selectedScopes.includes(scope.id)
                            return (
                              <label
                                key={scope.id}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition ${
                                  isChecked
                                    ? "bg-cyan-50 border-cyan-200 text-cyan-950 font-bold"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleScopeToggle(scope.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <div>
                                  <p className="text-[11px] font-bold leading-none">{scope.id}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{scope.label}</p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting || !inviteEmail.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {inviting ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                    <span>{inviting ? "Sending..." : "Send Invitation"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
