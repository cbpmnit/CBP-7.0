"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import { useVolunteerDetail } from "../hooks/useVolunteerDetail"
import { ALL_PERMISSION_SCOPES } from "../constants"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { PageHeader } from "@/components/ui/PageHeader"
import {
  FiArrowLeft,
  FiUser,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSave,
  FiCheck,
  FiCopy,
  FiSend,
  FiKey,
} from "react-icons/fi"

export default function VolunteerDetailView() {
  const params = useParams()
  const volunteerId = (params?.id as string) || ""

  const {
    volunteer,
    loading,
    saving,
    error,
    successMessage,
    updatePermissions,
  } = useVolunteerDetail(volunteerId)

  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [copiedLink, setCopiedLink] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (volunteer) {
      setSelectedScopes(volunteer.permissions || [])
    }
  }, [volunteer])

  useEffect(() => {
    if (successMessage) {
      setSaveSuccess(true)
      const timer = setTimeout(() => setSaveSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    )
  }

  const handleCopyActivationLink = () => {
    if (!volunteer?.activationLink) return
    navigator.clipboard.writeText(volunteer.activationLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault()
    await updatePermissions({ permissions: selectedScopes })
  }

  if (loading) {
    return (
      <div className="flex-1 w-full min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-slate-500 space-y-2">
          <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading volunteer profile...</p>
        </div>
      </div>
    )
  }

  if (error || !volunteer) {
    return (
      <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-4">
        <Link
          href="/admin/volunteers"
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider"
        >
          <FiArrowLeft /> Back to Roster
        </Link>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
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
      <div className="space-y-4">
        {/* Navigation & Header */}
        <PageHeader
          title={volunteer.name || "Volunteer Profile"}
          subtitle={`Staff ID: ${volunteer.id} • ${volunteer.email}`}
          actions={
            <Link
              href="/admin/volunteers"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition"
            >
              <FiArrowLeft /> Back to Roster
            </Link>
          }
        />

        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600 text-base" />
            <span>Volunteer permission scopes saved and updated successfully ✓</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <ProfileAvatar name={volunteer.name || "Volunteer"} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">{volunteer.name}</h2>
                <StatusBadge status={volunteer.status} />
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{volunteer.email}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Role: <strong className="text-slate-900 font-bold">VOLUNTEER</strong> &middot; Permissions: <strong className="text-cyan-800">{selectedScopes.length} Enabled</strong>
              </p>
            </div>
          </div>

          {isInvited && volunteer.activationLink && (
            <button
              onClick={handleCopyActivationLink}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 border border-cyan-200 shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              {copiedLink ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
              <span>{copiedLink ? "Link Copied ✓" : "Copy Setup Link"}</span>
            </button>
          )}
        </div>

        {/* SECTION 1: Identity Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
            <FiUser className="text-cyan-700" /> 1. Identity &amp; System Record
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block font-bold text-slate-400 uppercase text-[10px]">Full Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{volunteer.name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block font-bold text-slate-400 uppercase text-[10px]">Official Email</span>
              <p className="font-mono font-semibold text-slate-900 mt-0.5">{volunteer.email}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block font-bold text-slate-400 uppercase text-[10px]">Account Status</span>
              <p className="font-bold text-slate-900 mt-0.5">{volunteer.status}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block font-bold text-slate-400 uppercase text-[10px]">Registered On</span>
              <p className="font-mono text-slate-700 mt-0.5">
                {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : "System Onboarding"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: RBAC Permission Scopes Configuration Form */}
        <form onSubmit={handleSavePermissions} className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FiKey className="text-cyan-700" /> 2. Granular Permission Scopes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure active authorization capabilities assigned to this volunteer staff member
                </p>
              </div>

              <span className="text-xs font-bold font-mono text-cyan-900 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                {selectedScopes.length} Scopes Active
              </span>
            </div>

            {/* Scope Category Sections */}
            <div className="space-y-4">
              {scopeCategories.map((category) => {
                const categoryScopes = ALL_PERMISSION_SCOPES.filter((s) => s.category === category)

                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      {category}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {categoryScopes.map((scope) => {
                        const isChecked = selectedScopes.includes(scope.id)

                        return (
                          <div
                            key={scope.id}
                            onClick={() => handleScopeToggle(scope.id)}
                            className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? "bg-cyan-50/40 border-cyan-600 shadow-2xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{scope.label}</span>
                                <span className="font-mono text-[9px] font-bold uppercase text-slate-400">
                                  {scope.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {scope.label}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Form Action Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Link
                href="/admin/volunteers"
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? <FiRefreshCw className="animate-spin text-xs" /> : <FiSave className="text-xs" />}
                <span>{saving ? "Saving..." : "Save Permissions"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  )
}
