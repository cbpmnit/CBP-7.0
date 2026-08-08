"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { volunteerService, VolunteerListItemResponse } from "@/services/volunteerService"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUsers,
  FiUserPlus,
  FiMail,
  FiRefreshCw,
  FiSlash,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiX,
  FiEye,
  FiSearch,
} from "react-icons/fi"

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerListItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Invite Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [volunteerName, setVolunteerName] = useState("")
  const [volunteerEmail, setVolunteerEmail] = useState("")

  // Detail Modal
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerListItemResponse | null>(null)

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    setLoading(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      const data = await volunteerService.getAllVolunteers()
      setVolunteers(data || [])
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load volunteer directory.")
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!volunteerEmail.trim()) {
      setErrorMessage("Volunteer email address is required.")
      return
    }

    setInviteLoading(true)
    setErrorMessage(null)
    setMessage(null)

    try {
      await volunteerService.inviteVolunteer({
        email: volunteerEmail.trim(),
        name: volunteerName.trim() || undefined,
      })
      setMessage(`Invitation sent successfully to ${volunteerEmail}!`)
      setModalOpen(false)
      setVolunteerName("")
      setVolunteerEmail("")
      fetchVolunteers()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send volunteer invitation.")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleResend = async (id: string, email: string) => {
    setMessage(null)
    setErrorMessage(null)
    try {
      await volunteerService.resendInvitation(id)
      setMessage(`Invitation renewed and resent to ${email} ✓`)
      fetchVolunteers()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend volunteer invitation.")
    }
  }

  const handleDisable = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disable volunteer access for ${name}?`)) return
    setMessage(null)
    setErrorMessage(null)
    try {
      await volunteerService.disableVolunteer(id)
      setMessage(`Volunteer ${name} has been disabled.`)
      fetchVolunteers()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to disable volunteer.")
    }
  }

  const filteredVolunteers = volunteers.filter((v) => {
    const query = searchQuery.toLowerCase()
    return (
      (v.name || "").toLowerCase().includes(query) ||
      (v.email || "").toLowerCase().includes(query) ||
      (v.status || "").toLowerCase().includes(query)
    )
  })

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Top Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <FiArrowLeft /> Admin Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Volunteer Management Portal
            </span>
          </div>

          {/* Title and Invite Action Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Volunteer <span className="gradient-text-cyan">Roster</span>
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Onboard, manage, and monitor event gate scanner volunteers and their invitation status.
              </p>
            </div>

            <button
              onClick={() => {
                setModalOpen(true)
                setErrorMessage(null)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition shadow-cyan-600/20 shrink-0"
            >
              <FiUserPlus className="text-base" /> Add Volunteer
            </button>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold text-center flex items-center justify-center gap-2">
              <FiCheckCircle className="text-base text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-900 text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or status..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 font-medium"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredVolunteers.length}</span> volunteers
            </div>
          </div>

          {/* Volunteers Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium animate-pulse">
                Loading volunteer records...
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="p-12 text-center">
                <FiUsers className="mx-auto text-4xl text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Volunteers Found</h4>
                <p className="text-xs text-slate-400 mt-0.5">Click &quot;Add Volunteer&quot; to invite a volunteer to CBP 7.0.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Name & Identifier</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Created / Invited Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredVolunteers.map((vol) => (
                      <tr key={vol.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-bold text-slate-900">{vol.name}</td>
                        <td className="py-4 px-6 font-mono text-slate-600">{vol.email}</td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                            {vol.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {vol.status === "ACTIVE" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <FiCheckCircle /> ACTIVE
                            </span>
                          )}
                          {vol.status === "PENDING" || vol.status === "INVITED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <FiClock /> INVITED (PENDING)
                            </span>
                          ) : null}
                          {vol.status === "DISABLED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <FiSlash /> DISABLED
                            </span>
                          )}
                          {vol.status === "EXPIRED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              EXPIRED
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                          {vol.createdAt ? vol.createdAt.substring(0, 10) : "Recent"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedVolunteer(vol)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="View Details"
                            >
                              <FiEye />
                            </button>

                            {vol.status !== "ACTIVE" && (
                              <button
                                onClick={() => handleResend(vol.id, vol.email)}
                                className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 transition border border-cyan-200"
                                title="Resend Invitation"
                              >
                                <FiRefreshCw />
                              </button>
                            )}

                            {vol.status !== "DISABLED" && (
                              <button
                                onClick={() => handleDisable(vol.id, vol.name)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200"
                                title="Disable Volunteer"
                              >
                                <FiSlash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* MODAL 1: Invite Volunteer Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-xl" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="h-8 w-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-sm shadow-sm shadow-cyan-600/30">
                  <FiMail />
                </span>
                <h3 className="text-lg font-bold text-slate-900">Invite Volunteer</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Send an official CBP 7.0 onboarding email with a 24-hour secure activation token.
              </p>

              <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Volunteer Name
                  </label>
                  <input
                    type="text"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Volunteer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={volunteerEmail}
                    onChange={(e) => setVolunteerEmail(e.target.value)}
                    placeholder="e.g. volunteer@mnit.ac.in"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 rounded-xl bg-slate-100 border border-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-1/2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                  >
                    {inviteLoading ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: View Volunteer Details */}
        {selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl relative space-y-4">
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-xl" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">Volunteer Details</h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Name</span>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedVolunteer.name}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Email</span>
                  <p className="text-slate-900 font-mono mt-0.5">{selectedVolunteer.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Role</span>
                    <p className="text-slate-900 font-bold mt-0.5">{selectedVolunteer.role}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
                    <p className="text-cyan-800 font-bold mt-0.5">{selectedVolunteer.status}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedVolunteer(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  )
}
