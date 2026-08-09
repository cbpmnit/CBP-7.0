"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import {
  adminVolunteerService,
  VolunteerDetail,
  ALL_PERMISSION_SCOPES,
} from "@/services/adminVolunteerService"
import {
  FiArrowLeft,
  FiUser,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSave,
  FiSend,
  FiCalendar,
  FiClock,
  FiCopy,
  FiCheck,
  FiLock,
  FiPhone,
  FiMail,
} from "react-icons/fi"

export default function AdminVolunteerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const volunteerId = params?.id as string

  const [volunteer, setVolunteer] = useState<VolunteerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Scope Selection State
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (volunteerId) {
      fetchVolunteerDetail()
    }
  }, [volunteerId])

  const fetchVolunteerDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminVolunteerService.getVolunteerById(volunteerId)
      setVolunteer(data)
      setSelectedScopes(data.permissions || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load volunteer detail.")
    } finally {
      setLoading(false)
    }
  }

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    )
  }

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      const updated = await adminVolunteerService.updatePermissions(volunteerId, {
        permissions: selectedScopes,
      })
      setVolunteer(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || "Failed to update permission scopes.")
    } finally {
      setSaving(false)
    }
  }

  const handleCopyActivationLink = () => {
    if (!volunteer?.activationLink) return
    navigator.clipboard.writeText(volunteer.activationLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500 space-y-2">
          <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading volunteer profile dossier...</p>
        </div>
      </div>
    )
  }

  if (error || !volunteer) {
    return (
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-4">
        <Link
          href="/admin/volunteers"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider"
        >
          <FiArrowLeft /> Back to Roster
        </Link>
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
          <FiAlertCircle className="text-xl text-amber-700 shrink-0" />
          <span className="text-xs font-semibold">{error || "Volunteer record not found."}</span>
        </div>
      </main>
    )
  }

  const isInvited = volunteer.status === "INVITED" || volunteer.status === "PENDING"
  const scopeCategories = Array.from(new Set(ALL_PERMISSION_SCOPES.map((s) => s.category)))

  return (
    <PageTransition>
      <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href="/admin/volunteers"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
              >
                <FiArrowLeft /> Back to Volunteer Roster
              </Link>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
                Volunteer Profile Dossier
              </span>
            </div>

            {/* Profile Header Banner (Clean Institutional Theme) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <ProfileAvatar name={volunteer.name || "Volunteer"} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{volunteer.name}</h1>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        volunteer.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isInvited
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {volunteer.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{volunteer.email}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Role: <strong className="text-slate-900 font-bold">VOLUNTEER</strong> • Assigned Scopes: <strong className="text-cyan-800">{selectedScopes.length} Scopes Active</strong>
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {isInvited && volunteer.activationLink && (
                  <button
                    onClick={handleCopyActivationLink}
                    className="px-4 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 border border-cyan-200 shadow-sm"
                  >
                    {copiedLink ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                    <span>{copiedLink ? "Link Copied ✓" : "Copy Setup Link"}</span>
                  </button>
                )}
              </div>
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                <FiCheckCircle className="text-emerald-600 text-base" />
                <span>Volunteer permission scopes saved and updated successfully ✓</span>
              </div>
            )}

            {/* SECTION 1: Basic Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FiUser className="text-cyan-700" /> 1. Volunteer Account Information
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-400">System Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div>
                  <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Full Name</span>
                  <p className="font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {volunteer.name}
                  </p>
                </div>

                <div>
                  <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Official Email</span>
                  <p className="font-mono font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {volunteer.email}
                  </p>
                </div>

                <div>
                  <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Contact Phone</span>
                  <p className="font-mono font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {volunteer.phoneNumber || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Account Status</span>
                  <p className="font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${volunteer.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {volunteer.status}
                  </p>
                </div>

                <div>
                  <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Created Date</span>
                  <p className="font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {volunteer.createdAt ? volunteer.createdAt.replace("T", " ").substring(0, 16) : "August 2026"}
                  </p>
                </div>

                <div>
                  <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Last Session Access</span>
                  <p className="font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {volunteer.lastLogin ? volunteer.lastLogin.replace("T", " ").substring(0, 16) : "Active User"}
                  </p>
                </div>
              </div>

              {/* Activation Link display for Invited Volunteers */}
              {isInvited && volunteer.activationLink && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <FiSend className="text-amber-700" /> Pending Invitation Activation Link
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={volunteer.activationLink}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono text-[11px] text-slate-700"
                    />
                    <button
                      onClick={handleCopyActivationLink}
                      className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold uppercase text-[11px]"
                    >
                      {copiedLink ? "Copied ✓" : "Copy Link"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Permission Scopes Management Form */}
            <form onSubmit={handleSavePermissions} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <FiShield className="text-cyan-700" /> 2. Assigned Permission Scopes (RBAC)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select scope chips below to grant or revoke specific operational permissions for this volunteer.
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                  {selectedScopes.length} Scopes Granted
                </span>
              </div>

              {/* Grouped Permission Scope Chips & Checkboxes */}
              <div className="space-y-6">
                {scopeCategories.map((cat) => (
                  <div key={cat} className="space-y-2.5">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                      <span>{cat} Permissions</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ALL_PERMISSION_SCOPES.filter((s) => s.category === cat && selectedScopes.includes(s.id)).length} / {ALL_PERMISSION_SCOPES.filter((s) => s.category === cat).length} Enabled
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ALL_PERMISSION_SCOPES.filter((s) => s.category === cat).map((scope) => {
                        const isChecked = selectedScopes.includes(scope.id)
                        return (
                          <label
                            key={scope.id}
                            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs font-medium cursor-pointer transition ${
                              isChecked
                                ? "bg-cyan-50/80 border-cyan-300 text-cyan-950 font-bold shadow-xs"
                                : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleScopeToggle(scope.id)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <p className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                {scope.id}
                                {isChecked && <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">ENABLED</span>}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-normal">{scope.label}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium">
                  Changes take effect immediately upon saving permissions.
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/volunteers"
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 shadow-sm shadow-cyan-600/20 disabled:opacity-50"
                  >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    <span>{saving ? "Saving..." : "Save Permission Scopes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
    </PageTransition>
  )
}
