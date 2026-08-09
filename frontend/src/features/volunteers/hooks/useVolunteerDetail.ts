"use client"

import { useState, useEffect, useCallback } from "react"
import { volunteerApi } from "../services/volunteerApi"
import { VolunteerDetail, UpdateVolunteerPermissionsPayload } from "../types"

export function useVolunteerDetail(volunteerId: string) {
  const [volunteer, setVolunteer] = useState<VolunteerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchVolunteer = useCallback(async () => {
    if (!volunteerId) return
    setLoading(true)
    setError(null)
    try {
      const data = await volunteerApi.getVolunteerById(volunteerId)
      setVolunteer(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load volunteer record")
    } finally {
      setLoading(false)
    }
  }, [volunteerId])

  useEffect(() => {
    fetchVolunteer()
  }, [fetchVolunteer])

  const updatePermissions = async (payload: UpdateVolunteerPermissionsPayload) => {
    if (!volunteerId) return
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await volunteerApi.updatePermissions(volunteerId, payload)
      setVolunteer(updated)
      setSuccessMessage("Permission scopes updated successfully! ✓")
    } catch (err: any) {
      setError(err?.message || "Failed to update permissions")
    } finally {
      setSaving(false)
    }
  }

  return {
    volunteer,
    loading,
    saving,
    error,
    successMessage,
    updatePermissions,
    reload: fetchVolunteer,
  }
}
