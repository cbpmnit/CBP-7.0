"use client"

import { useState, useEffect, useCallback } from "react"
import { volunteerApi } from "../services/volunteerApi"
import {
  VolunteerListItem,
  VolunteerInvitationItem,
  VolunteerInviteCheckResult,
  GrantAccessPayload,
  CreateVolunteerPayload,
} from "../types"

export type VolunteerTab = "active" | "pending"

export function useVolunteers() {
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

  const loadAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [volunteersRes, invitationsRes] = await Promise.allSettled([
        volunteerApi.getAllVolunteers(),
        volunteerApi.getPendingInvitations(),
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
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

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
      const res = await volunteerApi.inviteVolunteer({ email: cleanEmail })
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
    } catch {
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
        const payload: GrantAccessPayload = {
          userIdOrEmail: checkResult.userId,
          name: inviteName.trim() || checkResult.name,
          permissions: selectedScopes,
          assignedSessions: ["All Workshop Sessions"],
        }
        await volunteerApi.grantVolunteerAccess(payload)
        setActionMessage(`Volunteer access granted successfully to ${checkResult.name || email}! ✓`)
        setActiveTab("active")
      } else {
        const payload: CreateVolunteerPayload = {
          email,
          name: inviteName.trim() || undefined,
          permissions: selectedScopes,
        }
        const res = await volunteerApi.inviteVolunteer(payload)
        if (res.exists && res.userId) {
          const grantPayload: GrantAccessPayload = {
            userIdOrEmail: res.userId,
            name: res.name || inviteName.trim(),
            permissions: selectedScopes,
            assignedSessions: ["All Workshop Sessions"],
          }
          await volunteerApi.grantVolunteerAccess(grantPayload)
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
      await volunteerApi.disableVolunteer(id)
      setActionMessage("Volunteer status updated successfully ✓")
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to update status.")
    }
  }

  const handleResendInvite = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const msg = await volunteerApi.resendInvitation(id)
      setActionMessage(msg)
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to resend invitation.")
    }
  }

  const handleRevokeInvite = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const msg = await volunteerApi.revokeInvitation(id)
      setActionMessage(msg)
      loadAllData()
    } catch (err: any) {
      setError(err?.message || "Failed to revoke invitation.")
    }
  }

  const handleOpenDetails = (inv: VolunteerInvitationItem) => {
    setSelectedInvitation(inv)
    setIsDetailsModalOpen(true)
    setCopiedLink(false)
  }

  const handleCopyLink = (link?: string) => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return {
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
    reload: loadAllData,
  }
}
