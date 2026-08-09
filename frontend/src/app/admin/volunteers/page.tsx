"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import {
  adminVolunteerService,
  VolunteerListItem,
  VolunteerInvitationItem,
  VolunteerInviteCheckResult,
  ALL_PERMISSION_SCOPES,
  CreateVolunteerPayload,
  GrantAccessPayload,
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
  FiActivity,
  FiUserCheck,
  FiKey,
  FiInfo,
  FiClock,
  FiMail,
  FiCopy,
  FiXCircle,
  FiCalendar,
} from "react-icons/fi"

type VolunteerTab = "active" | "pending"

export default function AdminVolunteersPage() {
  const [activeTab, setActiveTab] = useState<VolunteerTab>("active")
  const [activeVolunteers, setActiveVolunteers] = useState<VolunteerListItem[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<VolunteerInvitationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Invite / Grant Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "ATTENDANCE_SCAN",
    "ATTENDANCE_VIEW",
  ])
  const [inviting, setInviting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Existing User Detection State
  const [checkResult, setCheckResult] = useState<VolunteerInviteCheckResult | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Invitation Details Modal State
  const [selectedInvitation, setSelectedInvitation] = useState<VolunteerInvitationItem | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [volunteersRes, invitationsRes] = await Promise.allSettled([
        adminVolunteerService.getAllVolunteers(),
        adminVolunteerService.getPendingInvitations(),
      ])

      if (volunteersRes.status === "fulfilled") {
        setActiveVolunteers(volunteersRes.value || [])
      }
      if (invitationsRes.status === "fulfilled") {
        setPendingInvitations(invitationsRes.value || [])
      }
    } catch (err: any) {
      console.error("Failed to load volunteer records", err)
      setError("Failed to load volunteer roster. Please refresh.")
    } finally {
      setLoading(false)
    }
  }

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    )
  }

  const handleCheckEmail = async (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setCheckResult(null)
      return
    }

    setIsCheckingEmail(true)
    try {
      const res = await adminVolunteerService.inviteVolunteer({ email: cleanEmail })
      if (res.exists) {
        setCheckResult(res)
        if (res.name) setInviteName(res.name)
      } else {
        setCheckResult({
          exists: false,
          email: cleanEmail,
          status: "PENDING",
        })
      }
    } catch (err) {
      setCheckResult({
        exists: false,
        email: cleanEmail,
        status: "PENDING",
      })
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleInviteOrGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    setActionMessage(null)
    setError(null)

    try {
      const email = inviteEmail.trim().toLowerCase()

      if (checkResult?.exists && checkResult.userId) {
        // Scenario 2: Existing User -> Direct Scope & Role Grant
        const payload: GrantAccessPayload = {
          userIdOrEmail: checkResult.userId,
          name: inviteName.trim() || checkResult.name,
          permissions: selectedScopes,
          assignedSessions: ["All Workshop Sessions"],
        }
        await adminVolunteerService.grantVolunteerAccess(payload)
        setActionMessage(`Volunteer access granted successfully to ${checkResult.name || email}! ✓`)
        setActiveTab("active")
      } else {
        // Scenario 1: New User -> Create Invitation & Dispatch Setup Token
        const payload: CreateVolunteerPayload = {
          email,
          name: inviteName.trim() || undefined,
          permissions: selectedScopes,
        }
        const res = await adminVolunteerService.inviteVolunteer(payload)
        if (res.exists && res.userId) {
          const grantPayload: GrantAccessPayload = {
            userIdOrEmail: res.userId,
            name: res.name || inviteName.trim(),
            permissions: selectedScopes,
            assignedSessions: ["All Workshop Sessions"],
          }
          await adminVolunteerService.grantVolunteerAccess(grantPayload)
          setActionMessage(`Volunteer access granted to existing user ${res.name || email}! ✓`)
          setActiveTab("active")
        } else {
          setActionMessage(`Invitation created and dispatch link generated for ${email}! ✓`)
          setActiveTab("pending")
        }
      }

      setIsInviteModalOpen(false)
      setInviteEmail("")
      setInviteName("")
      setCheckResult(null)
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to process volunteer invitation.")
    } finally {
      setInviting(false)
    }
  }

  const handleToggleDisable = async (id: string) => {
    try {
      await adminVolunteerService.disableVolunteer(id)
      setActionMessage("Volunteer status updated successfully ✓")
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to update status.")
    }
  }

  const handleResend = async (id: string) => {
    try {
      const msg = await adminVolunteerService.resendInvitation(id)
      setActionMessage(msg)
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to resend invitation.")
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this volunteer invitation? The link will be invalidated immediately.")) {
      return
    }
    try {
      const msg = await adminVolunteerService.revokeInvitation(id)
      setActionMessage(msg)
      if (selectedInvitation?.id === id) {
        setIsDetailsModalOpen(false)
      }
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to revoke invitation.")
    }
  }

  const handleOpenDetails = (invitation: VolunteerInvitationItem) => {
    setSelectedInvitation(invitation)
    setCopiedLink(false)
    setIsDetailsModalOpen(true)
  }

  const handleCopyLink = (link?: string) => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Filter Active Volunteers
  const filteredActive = activeVolunteers.filter((v) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q))
    )
  })

  // Filter Pending Invitations
  const filteredPending = pendingInvitations.filter((inv) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (inv.name && inv.name.toLowerCase().includes(q)) ||
      (inv.email && inv.email.toLowerCase().includes(q)) ||
      (inv.status && inv.status.toLowerCase().includes(q))
    )
  })

  const scopeCategories = Array.from(new Set(ALL_PERMISSION_SCOPES.map((s) => s.category)))

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <PermissionGuard requiredPermission="VOLUNTEER_MANAGE">
            <div className="mx-auto max-w-6xl space-y-6">
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
                  Volunteer Operations <span className="gradient-text-cyan">Console</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Manage active volunteer accounts, monitor pending onboarding invitations, track delivery status, and configure scope permissions.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <button
                  onClick={() => {
                    setCheckResult(null)
                    setInviteEmail("")
                    setInviteName("")
                    setIsInviteModalOpen(true)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 shadow-cyan-600/20"
                >
                  <FiUserPlus /> Invite / Grant Volunteer Access
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

            {/* Sub-Navigation Tabs: Active Volunteers vs Pending Invitations */}
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
                    {activeVolunteers.length}
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
                    {pendingInvitations.length}
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

            {/* TAB 1: ACTIVE VOLUNTEERS DIRECTORY */}
            {activeTab === "active" && (
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

                              <td className="px-6 py-4 text-right space-x-1.5">
                                <Link
                                  href={`/admin/volunteers/${v.id}`}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition inline-flex items-center gap-1"
                                >
                                  <FiEye /> Profile
                                </Link>
                                <Link
                                  href={`/admin/volunteers/${v.id}`}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-cyan-200"
                                >
                                  <FiEdit /> Scopes
                                </Link>
                                <button
                                  onClick={() => handleToggleDisable(v.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 border ${
                                    isDisabled
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                                  }`}
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
            )}

            {/* TAB 2: PENDING INVITATIONS DIRECTORY */}
            {activeTab === "pending" && (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <FiRefreshCw className="animate-spin text-2xl mx-auto text-cyan-600" />
                    <p className="text-xs font-semibold">Loading pending volunteer invitations...</p>
                  </div>
                ) : filteredPending.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <FiMail className="text-3xl mx-auto text-slate-300" />
                    <h3 className="text-xs font-bold text-slate-700">No Pending Invitations</h3>
                    <p className="text-[11px] text-slate-400">
                      All invited volunteers have accepted their credentials or no invitations have been sent.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3.5">Volunteer Name</th>
                          <th className="px-6 py-3.5">Email Address</th>
                          <th className="px-6 py-3.5">Invitation Status</th>
                          <th className="px-6 py-3.5">Invited On</th>
                          <th className="px-6 py-3.5">Expires On</th>
                          <th className="px-6 py-3.5">Email Delivery</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredPending.map((inv) => {
                          const isPending = inv.status === "PENDING"
                          const isExpired = inv.status === "EXPIRED"
                          const isRevoked = inv.status === "REVOKED"
                          const isFailed = inv.status === "EMAIL_FAILED"

                          return (
                            <tr key={inv.id} className="hover:bg-cyan-50/30 transition">
                              <td className="px-6 py-4 font-extrabold text-slate-900">
                                {inv.name || "Volunteer"}
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-600">
                                {inv.email}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                    isPending
                                      ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                                      : isExpired
                                      ? "bg-orange-50 text-orange-800 border-orange-200"
                                      : isFailed
                                      ? "bg-rose-50 text-rose-800 border-rose-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {isPending && <FiActivity />}
                                  {isExpired && <FiClock />}
                                  {isRevoked && <FiXCircle />}
                                  {isFailed && <FiAlertCircle />}
                                  <span>
                                    {isPending
                                      ? "Pending Acceptance"
                                      : isExpired
                                      ? "Expired"
                                      : isRevoked
                                      ? "Revoked"
                                      : "Email Failed"}
                                  </span>
                                </span>
                              </td>

                              <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                              </td>

                              <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                                {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "—"}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    inv.emailDeliveryStatus === "FAILED"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : inv.emailDeliveryStatus === "RESENT"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  <FiMail className="text-xs" />
                                  <span>{inv.emailDeliveryStatus || "SENT"}</span>
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleOpenDetails(inv)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition inline-flex items-center gap-1"
                                >
                                  <FiEye /> Details
                                </button>
                                {!isRevoked && (
                                  <button
                                    onClick={() => handleResend(inv.id)}
                                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-purple-200"
                                    title="Resend invitation email and extend expiration"
                                  >
                                    <FiSend /> Resend
                                  </button>
                                )}
                                {!isRevoked && (
                                  <button
                                    onClick={() => handleRevoke(inv.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold transition inline-flex items-center gap-1 border border-rose-200"
                                    title="Revoke invitation link"
                                  >
                                    <FiXCircle /> Revoke
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INVITATION DETAILS MODAL */}
          {isDetailsModalOpen && selectedInvitation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-lg">
                      <FiMail />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Invitation Dossier</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{selectedInvitation.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Volunteer Name</span>
                      <span className="font-bold text-slate-900">{selectedInvitation.name || "Volunteer"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Invitation Status</span>
                      <span className="font-bold font-mono text-cyan-800">{selectedInvitation.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Created Timestamp</span>
                      <span className="font-mono text-slate-700">
                        {selectedInvitation.createdAt ? new Date(selectedInvitation.createdAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Expires At</span>
                      <span className="font-mono text-slate-700">
                        {selectedInvitation.expiresAt ? new Date(selectedInvitation.expiresAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Status</span>
                      <span className="font-bold text-emerald-700">{selectedInvitation.emailDeliveryStatus || "SENT"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Invited By</span>
                      <span className="text-slate-700">{selectedInvitation.createdBy || "Admin"}</span>
                    </div>
                  </div>

                  {/* Failure Reason if Email Failed */}
                  {selectedInvitation.emailFailureReason && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                      <FiAlertCircle className="text-rose-600 shrink-0" />
                      <span>{selectedInvitation.emailFailureReason}</span>
                    </div>
                  )}

                  {/* Assigned Permission Scopes */}
                  <div>
                    <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider mb-1.5">
                      Assigned Permission Scopes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInvitation.permissions && selectedInvitation.permissions.length > 0 ? (
                        selectedInvitation.permissions.map((p) => (
                          <span
                            key={p}
                            className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-900 font-bold font-mono text-[10px]"
                          >
                            ✓ {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Default Attendance Scopes</span>
                      )}
                    </div>
                  </div>

                  {/* Activation Link Copy */}
                  {selectedInvitation.activationLink && (
                    <div>
                      <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider mb-1">
                        Activation Link
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={selectedInvitation.activationLink}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 select-all"
                        />
                        <button
                          onClick={() => handleCopyLink(selectedInvitation.activationLink)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <FiCopy /> {copiedLink ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {selectedInvitation.status !== "REVOKED" ? (
                    <button
                      onClick={() => handleRevoke(selectedInvitation.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition inline-flex items-center gap-1.5 border border-rose-200"
                    >
                      <FiXCircle /> Revoke Invitation
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {selectedInvitation.status !== "REVOKED" && (
                      <button
                        onClick={() => {
                          handleResend(selectedInvitation.id)
                          setIsDetailsModalOpen(false)
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition inline-flex items-center gap-1.5 border border-purple-200"
                      >
                        <FiSend /> Resend Email
                      </button>
                    )}
                    <button
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVITE / GRANT VOLUNTEER MODAL */}
          {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-lg">
                      {checkResult?.exists ? <FiUserCheck /> : <FiUserPlus />}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {checkResult?.exists ? "Grant Volunteer Access (Existing User)" : "Invite / Provision Volunteer"}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {checkResult?.exists
                          ? "Assign volunteer role & scopes directly without recreating credentials."
                          : "Enter email to provision account and assign scope-based permissions."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleInviteOrGrantSubmit} className="space-y-4">
                  {/* Email Input with Real-time Check */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Volunteer Email Address <span className="text-cyan-600">*</span>
                      </label>
                      {isCheckingEmail && (
                        <span className="text-[10px] text-cyan-600 font-semibold flex items-center gap-1">
                          <FiRefreshCw className="animate-spin" /> Checking account...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => {
                          setInviteEmail(e.target.value)
                          if (checkResult) setCheckResult(null)
                        }}
                        onBlur={(e) => handleCheckEmail(e.target.value)}
                        placeholder="volunteer@mnit.ac.in or student@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  {/* Scenario 2: Existing User Found Card */}
                  {checkResult?.exists && (
                    <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs">
                        <FiCheckCircle className="text-cyan-600 text-base" />
                        <span>Existing CBP 7.0 Account Found</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-cyan-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
                          <span className="font-bold text-slate-900">{checkResult.name || "Student User"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Roles</span>
                          <span className="font-mono font-bold text-cyan-800">
                            {checkResult.currentRoles?.join(", ") || "ROLE_STUDENT"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <FiInfo className="text-cyan-600 shrink-0" />
                        This user can log in with their existing password after volunteer access is granted.
                      </p>
                    </div>
                  )}

                  {/* Scenario 1: New User Name field */}
                  {!checkResult?.exists && (
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
                  )}

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
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-cyan-600/20"
                    >
                      {inviting ? (
                        <FiRefreshCw className="animate-spin" />
                      ) : checkResult?.exists ? (
                        <FiKey />
                      ) : (
                        <FiSend />
                      )}
                      <span>
                        {inviting
                          ? "Processing..."
                          : checkResult?.exists
                          ? "Grant Volunteer Access"
                          : "Send Invitation"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </PermissionGuard>
        </main>
      </div>
    </PageTransition>
  )
}
