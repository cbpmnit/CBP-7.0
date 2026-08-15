"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { api, ApiError } from "@/utils/api"
import { profileApi } from "@/features/profile/services/profileApi"
import { LoginRequest, LoginResponse } from "../types"
import { validateLogin } from "../schemas/authSchemas"

export function useLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIdentifier =
        localStorage.getItem("cbp-saved-identifier") ||
        localStorage.getItem("cbp-studentId") ||
        ""
      if (savedIdentifier) {
        setFormData((prev) => ({
          ...prev,
          identifier: savedIdentifier,
          rememberMe: true,
        }))
      }
    }
  }, [])

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "google_cancelled":
        case "oauth_cancelled":
          setError("Google sign-in was cancelled.")
          break
        case "oauth_provider_error":
        case "google_failed":
        case "oauth_failed":
          setError("Google authentication is temporarily unavailable.")
          break
        case "oauth_database_error":
          setError("Unable to complete sign-in. Please try again.")
          break
        case "oauth_account_creation_failed":
        case "account_creation_failed":
          setError("Unable to create your account.")
          break
        case "oauth_token_generation_failed":
        case "session_failed":
        case "session_error":
          setError("Login completed but session creation failed.")
          break
        case "missing_token":
          setError("Authentication response did not contain a valid session token.")
          break
        case "oauth_email_missing":
        case "email_missing":
          setError("Google account did not provide an email address.")
          break
        case "oauth_unknown_error":
        case "oauth_processing_failed":
          setError("Something went wrong. Please try again.")
          break
        default:
          setError("Google login failed. Please try again.")
          break
      }
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const validation = validateLogin(formData.identifier, formData.password)
    if (!validation.isValid) {
      setError(validation.error)
      setLoading(false)
      return
    }

    const cleanIdentifier = formData.identifier.trim()

    try {
      const loginPayload: LoginRequest = {
        identifier: cleanIdentifier,
        studentId: cleanIdentifier,
        password: formData.password,
      }

      const response = await api.post<LoginResponse>("/api/v1/auth/login", loginPayload)

      if (typeof window !== "undefined") {
        if (formData.rememberMe) {
          localStorage.setItem("cbp-saved-identifier", cleanIdentifier)
        } else {
          localStorage.removeItem("cbp-saved-identifier")
        }
      }

      dispatch(
        loginSuccess({
          token: response.token,
          studentId: response.studentId,
          name: response.name,
          role: response.role,
          permissions: response.permissions || [],
        })
      )

      let redirectPath = "/dashboard"
      const userRole = (response.role || "").toUpperCase()

      if (userRole === "ROLE_ADMIN" || userRole === "ADMIN") {
        redirectPath = "/admin/dashboard"
      } else if (userRole === "ROLE_VOLUNTEER" || userRole === "VOLUNTEER") {
        redirectPath = "/volunteer/dashboard"
      } else {
        try {
          const completion: any = await profileApi.getCompletion()
          if (completion && (completion.completed || completion.registrationEligible || completion.profileStatus === "COMPLETED")) {
            redirectPath = "/dashboard"
          } else {
            redirectPath = "/profile"
          }
        } catch {
          redirectPath = "/profile"
        }
      }

      setIsSubmitted(true)

      setTimeout(() => {
        router.push(redirectPath)
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.errorData?.errors) {
          const firstErrKey = Object.keys(err.errorData.errors)[0]
          setError(err.errorData.errors[firstErrKey] || "Invalid credentials. Please check your Student ID/email and password.")
        } else if (err.status === 401) {
          setError("Invalid credentials. Please check your Student ID/email and password.")
        } else if (err.status === 403) {
          setError("Access denied. Your account is disabled or unauthorized.")
        } else {
          setError(err.message || "Invalid credentials. Please check your Student ID/email and password.")
        }
      } else {
        setError("Invalid credentials. Please check your Student ID/email and password.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:9900"
    window.location.href = `${backendUrl}/api/v1/auth/google`
  }

  return {
    formData,
    loading,
    error,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleGoogleClick,
  }
}
