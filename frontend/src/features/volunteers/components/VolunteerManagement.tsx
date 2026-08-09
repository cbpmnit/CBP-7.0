"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useVolunteers } from "../hooks/useVolunteers"
import VolunteerFilters from "./VolunteerFilters"
import VolunteerTable from "./VolunteerTable"
import InviteVolunteerModal from "./InviteVolunteerModal"
import {
  FiShield,
  FiUserPlus,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi"

export default function VolunteerManagement() {
  const {
    activeTab,
    setActiveTab,
    activeVolunteers,
    pendingInvitations,
    loading,
    error,
    search,
    setSearch,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteEmail,
    setInviteEmail,
    inviteName,
    setInviteName,
    selectedScopes,
    handleScopeToggle,
    inviting,
    actionMessage,
    checkResult,
    setCheckResult,
    isCheckingEmail,
    handleCheckEmail,
    handleInviteOrGrantSubmit,
    handleToggleDisable,
    handleResendInvite,
    handleRevokeInvite,
    selectedInvitation,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    copiedLink,
    handleOpenDetails,
    handleCopyLink,
  } = useVolunteers()

  return (
    <PageTransition>
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

            {/* Sub-Navigation Tabs & Search */}
            <VolunteerFilters
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeCount={activeVolunteers.length}
              pendingCount={pendingInvitations.length}
              search={search}
              setSearch={setSearch}
            />

            {/* Volunteer Table */}
            <VolunteerTable
              activeTab={activeTab}
              activeVolunteers={activeVolunteers}
              pendingInvitations={pendingInvitations}
              loading={loading}
              search={search}
              handleToggleDisable={handleToggleDisable}
              handleResendInvite={handleResendInvite}
              handleRevokeInvite={handleRevokeInvite}
              handleOpenDetails={handleOpenDetails}
            />
          </div>

          {/* Invite & Details Modals */}
          <InviteVolunteerModal
            isInviteModalOpen={isInviteModalOpen}
            setIsInviteModalOpen={setIsInviteModalOpen}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteName={inviteName}
            setInviteName={setInviteName}
            selectedScopes={selectedScopes}
            handleScopeToggle={handleScopeToggle}
            inviting={inviting}
            checkResult={checkResult}
            setCheckResult={setCheckResult}
            isCheckingEmail={isCheckingEmail}
            handleCheckEmail={handleCheckEmail}
            handleInviteOrGrantSubmit={handleInviteOrGrantSubmit}
            selectedInvitation={selectedInvitation}
            isDetailsModalOpen={isDetailsModalOpen}
            setIsDetailsModalOpen={setIsDetailsModalOpen}
            copiedLink={copiedLink}
            handleCopyLink={handleCopyLink}
            handleRevokeInvite={handleRevokeInvite}
            handleResendInvite={handleResendInvite}
          />
        </PermissionGuard>
      </main>
    </PageTransition>
  )
}
