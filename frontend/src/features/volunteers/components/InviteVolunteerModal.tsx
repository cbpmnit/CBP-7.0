"use client"

import React from "react"
import { ALL_PERMISSION_SCOPES } from "../constants"
import { VolunteerInviteCheckResult, VolunteerInvitationItem } from "../types"
import {
  FiUserPlus,
  FiUserCheck,
  FiX,
  FiRefreshCw,
  FiKey,
  FiSend,
  FiCheckCircle,
  FiInfo,
  FiCopy,
  FiXCircle,
} from "react-icons/fi"

interface InviteVolunteerModalProps {
  isInviteModalOpen: boolean
  setIsInviteModalOpen: (open: boolean) => void
  inviteEmail: string
  setInviteEmail: (email: string) => void
  inviteName: string
  setInviteName: (name: string) => void
  selectedScopes: string[]
  handleScopeToggle: (scopeId: string) => void
  inviting: boolean
  checkResult: VolunteerInviteCheckResult | null
  setCheckResult: (res: VolunteerInviteCheckResult | null) => void
  isCheckingEmail: boolean
  handleCheckEmail: (email: string) => void
  handleInviteOrGrantSubmit: (e: React.FormEvent) => void
  // Details Modal
  selectedInvitation: VolunteerInvitationItem | null
  isDetailsModalOpen: boolean
  setIsDetailsModalOpen: (open: boolean) => void
  copiedLink: boolean
  handleCopyLink: (link?: string) => void
  handleRevokeInvite: (id: string, e?: React.MouseEvent) => void
  handleResendInvite: (id: string, e?: React.MouseEvent) => void
}

export default function InviteVolunteerModal({
  isInviteModalOpen,
  setIsInviteModalOpen,
  inviteEmail,
  setInviteEmail,
  inviteName,
  setInviteName,
  selectedScopes,
  handleScopeToggle,
  inviting,
  checkResult,
  setCheckResult,
  isCheckingEmail,
  handleCheckEmail,
  handleInviteOrGrantSubmit,
  selectedInvitation,
  isDetailsModalOpen,
  setIsDetailsModalOpen,
  copiedLink,
  handleCopyLink,
  handleRevokeInvite,
  handleResendInvite,
}: InviteVolunteerModalProps) {
  const scopeCategories = Array.from(new Set(ALL_PERMISSION_SCOPES.map((s) => s.category)))

  return (
    <>
      {/* INVITATION DETAILS MODAL */}
      {isDetailsModalOpen && selectedInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Volunteer Invitation Details</h3>
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
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvitation.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
                  <span className="font-bold text-slate-900">{selectedInvitation.name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Status</span>
                  <span className="font-bold text-emerald-700">{selectedInvitation.emailDeliveryStatus || "SENT"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expires</span>
                  <span className="font-mono text-slate-800">
                    {selectedInvitation.expiresAt
                      ? new Date(selectedInvitation.expiresAt).toLocaleDateString()
                      : "7 Days"}
                  </span>
                </div>
              </div>

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
                  onClick={() => handleRevokeInvite(selectedInvitation.id)}
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
                    onClick={(e) => {
                      handleResendInvite(selectedInvitation.id, e)
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
                    {checkResult?.exists
                      ? "Grant Volunteer Access (Existing User)"
                      : "Invite / Provision Volunteer"}
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
    </>
  )
}
