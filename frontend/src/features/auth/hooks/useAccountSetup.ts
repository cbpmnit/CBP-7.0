"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { api, ApiError } from "@/utils/api"
import { LoginResponse } from "../types"
import { validateAccountSetup } from "../schemas/authSchemas"

export function useAccountSetup() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedStudentId = studentId.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirm = confirmPassword.trim()

    const validation = validateAccountSetup(trimmedStudentId, trimmedPassword)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match. Please verify your password entry.")
      return
    }

    setLoading(true)

    try {
      const response = await api.post<LoginResponse>("/api/v1/auth/complete-account", {
        studentId: trimmedStudentId,
        password: trimmedPassword,
        confirmPassword: trimmedConfirm,
      })

      if (response && response.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-token", response.token)
          if (response.studentId) localStorage.setItem("cbp-studentId", response.studentId)
          if (response.name) localStorage.setItem("cbp-name", response.name)
          if (response.role) localStorage.setItem("cbp-role", response.role)
          if (response.userId) localStorage.setItem("cbp-userId", response.userId)
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

        setSuccess(true)
        setTimeout(() => {
          if (response.profileCompleted) {
            router.replace("/dashboard")
          } else {
            router.replace("/profile")
          }
        }, 1200)
      } else {
        setError("Account setup failed. Please try again.")
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to complete account setup.")
      } else {
        setError("An unexpected error occurred. Please check your credentials and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    studentId,
    setStudentId,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    handleSubmit,
  }
}
