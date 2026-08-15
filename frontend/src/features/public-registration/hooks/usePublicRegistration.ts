"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { publicRegistrationApi } from "../services/publicRegistrationApi"
import { validatePublicRegistrationForm } from "../schemas/publicRegistrationSchema"
import { PublicRegistrationFormData, PublicOrderResponse, PublicRegistrationStatusResponse } from "../types"
import { ApiError } from "@/utils/api"

export function usePublicRegistration() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"FORM" | "PAYMENT">("FORM")
  const [paymentAmount, setPaymentAmount] = useState<number>(100)
  const [paymentCurrency, setPaymentCurrency] = useState<string>("INR")

  const [formData, setFormData] = useState<PublicRegistrationFormData>({
    fullName: "",
    studentId: "",
    email: "",
    mobileNumber: "",
    programLevel: "UNDERGRADUATE",
    department: "Computer Science and Engineering",
    customDepartment: "",
    year: 1,
    studentType: "DAY_SCHOLAR",
    address: "",
    hostelNumber: "",
    roomNumber: "",
    expectations: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<PublicOrderResponse | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await publicRegistrationApi.getPaymentConfig()
        if (config && config.amount) {
          setPaymentAmount(config.amount)
          setPaymentCurrency(config.currency || "INR")
        }
      } catch (err) {
        console.warn("Using fallback payment configuration", err)
      }
    }
    fetchConfig()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const val = name === "year" ? parseInt(value, 10) || 1 : value

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const validationErrors = validatePublicRegistrationForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setErrorMessage("Please fix the highlighted errors before proceeding.")
      return
    }

    setLoading(true)
    try {
      const response = await publicRegistrationApi.createOrder({
        fullName: formData.fullName.trim(),
        studentId: formData.studentId.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        programLevel: formData.programLevel,
        department: formData.department.trim(),
        customDepartment: (formData.department === "Other" || formData.department === "OTHER") && formData.customDepartment
          ? formData.customDepartment.trim()
          : null,
        year: Number(formData.year) || 1,
        studentType: formData.studentType,
        address: formData.studentType === "DAY_SCHOLAR" ? formData.address.trim() : null,
        hostelNumber: formData.studentType === "HOSTELLER" ? formData.hostelNumber.trim() : null,
        roomNumber: formData.studentType === "HOSTELLER" ? formData.roomNumber.trim() : null,
        expectations: formData.expectations ? formData.expectations.trim() : null,
      })

      setOrderData(response)
      setStep("PAYMENT")
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to create registration order")
      } else {
        setErrorMessage("An unexpected error occurred while initiating your registration order.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!orderData) return
    setLoading(true)
    setErrorMessage(null)

    try {
      if (orderData.redirectUrl && (orderData.redirectUrl.startsWith("http://") || orderData.redirectUrl.startsWith("https://"))) {
        window.location.assign(orderData.redirectUrl)
      } else if (orderData.redirectUrl && orderData.redirectUrl.startsWith("/")) {
        router.push(orderData.redirectUrl)
      } else {
        setErrorMessage("Unable to redirect to payment gateway. Valid checkout URL was not provided.")
        setLoading(false)
      }
    } catch (err) {
      setErrorMessage("Unable to redirect to payment gateway. Please try again.")
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep("FORM")
    setOrderData(null)
    setErrorMessage(null)
  }

  return {
    loading,
    step,
    formData,
    errors,
    errorMessage,
    orderData,
    paymentAmount,
    paymentCurrency,
    handleChange,
    handleCreateOrder,
    handleProceedToPayment,
    resetForm,
    setStep,
  }
}
