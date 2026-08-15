"use client"

import React from "react"
import { ALL_PERMISSION_SCOPES } from "../constants"
import { VolunteerInviteCheckResult, VolunteerInvitationItem } from "../types"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Alert } from "@/components/ui/Alert"
import {
  FiUserPlus,
  FiUserCheck,
  FiRefreshCw,
  FiSend,
  FiCheckCircle,
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
      <Modal
        isOpen={Boolean(isDetailsModalOpen && selectedInvitation)}
        onClose={() => setIsDetailsModalOpen && setIsDetailsModalOpen(false)}
        title="Volunteer Invitation Record"
        maxWidth="lg"
      >
        {selectedInvitation && (
          <div className="space-y-4 text-xs">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink && handleCopyLink(selectedInvitation.activationLink)}
                    icon={<FiCopy />}
                  >
                    {copiedLink ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedInvitation.status !== "REVOKED" && handleRevokeInvite ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRevokeInvite(selectedInvitation.id)}
                  icon={<FiXCircle />}
                >
                  Revoke
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {selectedInvitation.status !== "REVOKED" && handleResendInvite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      handleResendInvite(selectedInvitation.id, e)
                      if (setIsDetailsModalOpen) setIsDetailsModalOpen(false)
                    }}
                    icon={<FiSend />}
                  >
                    Resend Email
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailsModalOpen && setIsDetailsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE INVITATION FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeInviteModal}
        title="Invite New Volunteer"
        description="Issue an invitation link or grant role permissions to existing MNIT students."
        maxWidth="2xl"
      >
        <form onSubmit={handleInviteOrGrantSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Institute Email Address"
                  type="email"
                  placeholder="e.g. volunteer@mnit.ac.in"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value)
                    if (checkResult) setCheckResult(null)
                  }}
                  required
                />
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleCheckEmail(inviteEmail)}
                disabled={isCheckingEmail || !inviteEmail.includes("@")}
                icon={isCheckingEmail ? <FiRefreshCw className="animate-spin" /> : undefined}
              >
                {isCheckingEmail ? "Checking..." : "Verify"}
              </Button>
            </div>

            {checkResult && (
              <Alert
                type={checkResult.exists ? "warning" : "info"}
                message={
                  checkResult.exists
                    ? `Account found for ${checkResult.name || inviteEmail} (${checkResult.role}). Submitting will grant VOLUNTEER role.`
                    : `No existing user record found. Submitting will send an email invitation.`
                }
              />
            )}

            <Input
              label="Volunteer Full Name (Optional)"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Access Permission Scopes
            </label>

            <div className="space-y-3 max-h-60 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              {scopeCategories.map((cat) => (
                <div key={cat} className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 font-mono">
                    {cat}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ALL_PERMISSION_SCOPES.filter((s) => s.category === cat).map((scope) => {
                      const isChecked = selectedScopes.includes(scope.id)
                      return (
                        <label
                          key={scope.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                            isChecked
                              ? "bg-cyan-50/80 border-cyan-300 text-cyan-950 font-semibold"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleScopeToggle(scope.id)}
                            className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <div>
                            <span className="block font-bold">{scope.label}</span>
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {(scope as any).description || scope.label}
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={closeInviteModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={inviting}
              icon={checkResult?.exists ? <FiUserCheck /> : <FiUserPlus />}
            >
              {checkResult?.exists ? "Grant Volunteer Access" : "Send Invitation"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
