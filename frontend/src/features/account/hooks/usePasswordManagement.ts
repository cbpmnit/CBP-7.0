"use client"

import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { authApi } from "@/features/auth/services/authApi"
import { loginSuccess } from "@/store/slices/authSlice"
import { ApiError } from "@/utils/api"
import { validatePasswordSetup, validatePasswordChange } from "../schemas/passwordSchema"

export function usePasswordManagement() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const hasPassword = auth.accountSetupCompleted === true

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const validation = validatePasswordSetup(newPassword, confirmPassword)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setLoading(true)
    try {
      const response = await authApi.setupPassword({
        password: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      })

      if (response && response.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-token", response.token)
        }
        dispatch(
          loginSuccess({
            token: response.token,
            userId: response.userId,
            studentId: response.studentId,
            name: response.name,
            role: response.role,
            permissions: Array.from(response.permissions || []),
          })
        )

        setSuccessMessage("Password created successfully. You can now login using your Student ID.")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create password.")
      } else {
        setError((err as Error)?.message || "An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const validation = validatePasswordChange(currentPassword, newPassword, confirmPassword)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setLoading(true)
    try {
      const msg = await authApi.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      })

      setSuccessMessage(typeof msg === "string" ? msg : "Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Current password is incorrect.")
      } else {
        setError((err as Error)?.message || "Failed to update password.")
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    auth,
    hasPassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    successMessage,
    handleSetupPassword,
    handleChangePassword,
  }
}
