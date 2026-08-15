"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "../services/authApi"
import { ApiError } from "@/utils/api"
import { RegisterRequest } from "../types"

export function useRegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterRequest>({
    studentId: "",
    email: "",
    studentEmail: "",
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[e.target.name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      setLoading(false)
      return
    }

    try {
      const payload: RegisterRequest = {
        ...formData,
        email: formData.studentEmail || formData.email,
      }
      await authApi.register(payload)
      setIsSuccess(true)
      setMessage("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.errorData?.errors) {
          setErrors(err.errorData.errors)
        } else {
          setMessage(err.message || "Registration failed. Please check your inputs.")
        }
      } else {
        setMessage("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    loading,
    errors,
    message,
    isSuccess,
    handleChange,
    handleSubmit,
  }
}
