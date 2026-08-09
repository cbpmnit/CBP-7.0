"use client"

import React from "react"
import { ALL_PERMISSION_SCOPES } from "../constants"
import { VolunteerInviteCheckResult, VolunteerInvitationItem } from "../types"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  FiUserPlus,
  FiUserCheck,
  FiX,
  FiRefreshCw,
  FiSend,
  FiCheckCircle,
  FiInfo,
  FiCopy,
  FiXCircle,
} from "react-icons/fi"

interface InviteVolunteerModalProps {
  isOpen?: boolean
  onClose?: () => void
  isInviteModalOpen?: boolean
  setIsInviteModalOpen?: (open: boolean) => void
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
  selectedInvitation?: VolunteerInvitationItem | null
  isDetailsModalOpen?: boolean
  setIsDetailsModalOpen?: (open: boolean) => void
  copiedLink?: boolean
  handleCopyLink?: (link?: string) => void
  handleRevokeInvite?: (id: string, e?: React.MouseEvent) => void
  handleResendInvite?: (id: string, e?: React.MouseEvent) => void
}

export default function InviteVolunteerModal({
  isOpen,
  onClose,
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
  const isModalOpen = isOpen !== undefined ? isOpen : (isInviteModalOpen || false)
  const closeInviteModal = () => {
    if (onClose) onClose()
    if (setIsInviteModalOpen) setIsInviteModalOpen(false)
  }

  const scopeCategories = Array.from(new Set(ALL_PERMISSION_SCOPES.map((s) => s.category)))

  return (
    <>
      {/* INVITATION DETAILS MODAL */}
      {isDetailsModalOpen && selectedInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Volunteer Invitation Record</h3>
              <button
                onClick={() => setIsDetailsModalOpen && setIsDetailsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvitation.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                  <span className="font-bold text-slate-900">{selectedInvitation.name || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedInvitation.emailDeliveryStatus || "SENT"} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                  <span className="font-mono text-slate-800">
                    {selectedInvitation.expiresAt
                      ? new Date(selectedInvitation.expiresAt).toLocaleDateString()
                      : "7 Days"}
                  </span>
                </div>
              </div>

              {/* Configured Permission Scopes */}
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Configured Scopes
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedInvitation.permissions && selectedInvitation.permissions.length > 0 ? (
                    selectedInvitation.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-xs">Standard Scanner Access</span>
                  )}
                </div>
              </div>

              {/* Activation Link */}
              {selectedInvitation.activationLink && (
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Direct Activation Link
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedInvitation.activationLink}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 select-all"
                    />
                    <button
                      onClick={() => handleCopyLink && handleCopyLink(selectedInvitation.activationLink)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FiCopy /> {copiedLink ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedInvitation.status !== "REVOKED" && handleRevokeInvite ? (
                <button
                  onClick={() => handleRevokeInvite(selectedInvitation.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition inline-flex items-center gap-1 border border-rose-200 cursor-pointer"
                >
                  <FiXCircle /> Revoke
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {selectedInvitation.status !== "REVOKED" && handleResendInvite && (
                  <button
                    onClick={(e) => {
                      handleResendInvite(selectedInvitation.id, e)
                      if (setIsDetailsModalOpen) setIsDetailsModalOpen(false)
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold transition inline-flex items-center gap-1 border border-cyan-200 cursor-pointer"
                  >
                    <FiSend /> Resend Email
                  </button>
                )}
                <button
                  onClick={() => setIsDetailsModalOpen && setIsDetailsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE / GRANT VOLUNTEER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-base">
                  {checkResult?.exists ? <FiUserCheck /> : <FiUserPlus />}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {checkResult?.exists
                      ? "Grant Volunteer Access"
                      : "Invite Volunteer Staff"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {checkResult?.exists
                      ? "Assign volunteer role & scopes directly to existing user."
                      : "Enter candidate email to provision staff account and assign scopes."}
                  </p>
                </div>
              </div>
              <button
                onClick={closeInviteModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleInviteOrGrantSubmit} className="space-y-3.5 text-xs">
              {/* Email Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Candidate Email <span className="text-cyan-600">*</span>
                  </label>
                  {isCheckingEmail && (
                    <span className="text-[10px] text-cyan-600 font-semibold flex items-center gap-1">
                      <FiRefreshCw className="animate-spin text-xs" /> Checking...
                    </span>
                  )}
                </div>
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
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              {/* Existing User Found Box */}
              {checkResult?.exists && (
                <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-900 font-bold text-xs">
                    <FiCheckCircle className="text-cyan-600" />
                    <span>Existing User Account Found</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-md border border-cyan-100">
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
                </div>
              )}

              {/* Candidate Full Name field */}
              {!checkResult?.exists && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Candidate Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                </div>
              )}

              {/* Permission Scope Checkboxes Grouped by Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Assign Permission Scopes
                </label>
                <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto">
                  {scopeCategories.map((cat) => (
                    <div key={cat} className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                        {cat}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {ALL_PERMISSION_SCOPES.filter((s) => s.category === cat).map((scope) => {
                          const isChecked = selectedScopes.includes(scope.id)
                          return (
                            <label
                              key={scope.id}
                              className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition ${
                                isChecked
                                  ? "bg-white border-cyan-400 text-cyan-950 font-bold shadow-2xs"
                                  : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleScopeToggle(scope.id)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 shrink-0 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <span className="font-mono text-[10px] font-bold block truncate">{scope.id}</span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {inviting ? (
                    <FiRefreshCw className="animate-spin text-xs" />
                  ) : checkResult?.exists ? (
                    <FiUserCheck className="text-xs" />
                  ) : (
                    <FiSend className="text-xs" />
                  )}
                  <span>
                    {inviting
                      ? "Processing..."
                      : checkResult?.exists
                      ? "Grant Volunteer Access"
                      : "Send Invitation Email"}
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
