"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useVolunteers } from "../hooks/useVolunteers"
import VolunteerFilters from "./VolunteerFilters"
import VolunteerTable from "./VolunteerTable"
import InviteVolunteerModal from "./InviteVolunteerModal"
import { PageHeader } from "@/components/ui/PageHeader"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import {
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

  const currentCount = activeTab === "active" ? activeVolunteers.length : pendingInvitations.length
  const countLabel = activeTab === "active" ? "active" : "pending"

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="VOLUNTEER_MANAGE">
        <div className="space-y-4">
          {/* Institutional Page Header */}
          <PageHeader
            title="Volunteer Staff"
            count={currentCount}
            countLabel={countLabel}
            subtitle="Manage operational staff accounts, duty assignments, and permission scopes"
            actions={
              <div className="flex items-center gap-2">
                <ExportCsvButton
                  endpoint="/api/v1/admin/volunteers/export"
                  filenamePrefix="cbp-volunteers"
                  params={{ search }}
                />
                <button
                  onClick={() => {
                    setCheckResult(null)
                    setInviteEmail("")
                    setInviteName("")
                    setIsInviteModalOpen(true)
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FiUserPlus className="text-sm" />
                  <span>Invite Volunteer</span>
                </button>
              </div>
            }
          />

          {/* Action Feedback Alerts */}
          {actionMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <FiAlertCircle className="text-rose-600 text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Control Bar: Compact Tabs & Search */}
          <VolunteerFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeCount={activeVolunteers.length}
            pendingCount={pendingInvitations.length}
            search={search}
            setSearch={setSearch}
          />

          {/* Compact Enterprise Data Table */}
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

          {/* Invite & Details Modal */}
          <InviteVolunteerModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
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
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
