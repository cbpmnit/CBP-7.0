"use client"

import { useState, useEffect, useCallback } from "react"
import { profileApi } from "../services/profileApi"
import { UserProfileRequest } from "../types"
import { ApiError } from "@/utils/api"

export function useStudentProfile() {
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [completionPct, setCompletionPct] = useState(0)

  const [openSections, setOpenSections] = useState({
    identity: true,
    academic: true,
    personal: true,
    hostel: true,
  })

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    profilePhotoUrl: "",
    gender: "MALE",
    dateOfBirth: "",
    phoneNumber: "",
    sameAsWhatsapp: true,
    whatsappNumber: "",
    institute: "MNIT Jaipur",
    course: "BTECH",
    branch: "COMPUTER_SCIENCE_ENGINEERING",
    year: 1,
    section: "",
    hosteller: false,
    roomNumber: "",
    city: "",
    state: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  const fetchProfileData = useCallback(async () => {
    setLoading(true)
    try {
      const [profData, compData] = await Promise.allSettled([
        profileApi.getProfile(),
        profileApi.getCompletion(),
      ])

      let profileExists = false
      let completed = false
      let percentage = 0

      if (compData.status === "fulfilled" && compData.value) {
        completed = Boolean(compData.value.completed)
        percentage = compData.value.completionPercentage || 0
        setIsComplete(completed)
        setCompletionPct(percentage)
      }

      if (profData.status === "fulfilled" && profData.value) {
        profileExists = true
        setHasProfile(true)
        const data = profData.value
        setFormData({
          firstName: data.firstName || "",
          middleName: data.middleName || "",
          lastName: data.lastName || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
          gender: data.gender || "MALE",
          dateOfBirth: data.dateOfBirth || "",
          phoneNumber: data.phoneNumber || "",
          sameAsWhatsapp: data.sameAsWhatsapp !== undefined ? Boolean(data.sameAsWhatsapp) : true,
          whatsappNumber: data.whatsappNumber || "",
          institute: data.institute || "MNIT Jaipur",
          course: data.course || "BTECH",
          branch: data.branch || "COMPUTER_SCIENCE_ENGINEERING",
          year: data.year || 1,
          section: data.section || "",
          hosteller: Boolean(data.hosteller),
          roomNumber: data.roomNumber || "",
          city: data.city || "",
          state: data.state || "",
        })
      } else {
        setHasProfile(false)
      }

      if (!profileExists || !completed || percentage < 100) {
        setIsEditing(true)
      } else {
        setIsEditing(false)
      }
    } catch {
      setIsEditing(true)
      setHasProfile(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const toggleSection = (sec: "identity" | "academic" | "personal" | "hostel") => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? parseInt(value, 10) || 1
        : value

    setFormData((prev) => {
      const next = { ...prev, [name]: val }
      if (name === "sameAsWhatsapp" && val === true) {
        next.whatsappNumber = next.phoneNumber
      }
      return next
    })

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const preparePayload = (): UserProfileRequest => {
    const phone = formData.phoneNumber ? formData.phoneNumber.trim() : ""
    const sameWhatsapp = Boolean(formData.sameAsWhatsapp)
    const whatsapp = sameWhatsapp
      ? phone
      : formData.whatsappNumber && formData.whatsappNumber.trim()
      ? formData.whatsappNumber.trim()
      : null

    return {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName && formData.middleName.trim() ? formData.middleName.trim() : null,
      lastName: formData.lastName.trim(),
      profilePhotoUrl: formData.profilePhotoUrl && formData.profilePhotoUrl.trim() ? formData.profilePhotoUrl.trim() : null,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth && formData.dateOfBirth.trim() ? formData.dateOfBirth.trim() : null,
      phoneNumber: phone,
      sameAsWhatsapp: sameWhatsapp,
      whatsappNumber: whatsapp,
      institute: formData.institute && formData.institute.trim() ? formData.institute.trim() : "MNIT Jaipur",
      course: formData.course,
      branch: formData.branch,
      year: Number(formData.year) || 1,
      section: formData.section && formData.section.trim() ? formData.section.trim() : null,
      hosteller: Boolean(formData.hosteller),
      roomNumber: formData.hosteller && formData.roomNumber && formData.roomNumber.trim() ? formData.roomNumber.trim() : null,
      city: formData.city && formData.city.trim() ? formData.city.trim() : null,
      state: formData.state && formData.state.trim() ? formData.state.trim() : null,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setMessage(null)

    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits"
    }

    if (!formData.sameAsWhatsapp && formData.whatsappNumber && formData.whatsappNumber.trim()) {
      if (!/^\d{10}$/.test(formData.whatsappNumber.trim())) {
        newErrors.whatsappNumber = "WhatsApp number must be exactly 10 digits"
      }
    }

    if (formData.hosteller && (!formData.roomNumber || !formData.roomNumber.trim())) {
      newErrors.roomNumber = "Room number is required for hostellers"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSaveLoading(false)
      setMessage("Please correct the highlighted validation errors.")
      return
    }

    try {
      const payload = preparePayload()
      if (hasProfile) {
        await profileApi.updateProfile(payload)
      } else {
        await profileApi.createProfile(payload)
      }

      setMessage("Profile saved successfully!")
      setHasProfile(true)
      setIsEditing(false)
      await fetchProfileData()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorData?.errors) {
          setErrors(err.errorData.errors)
        }
        setMessage(err.message || "Failed to save profile")
      } else {
        setMessage("An unexpected error occurred while saving your profile.")
      }
    } finally {
      setSaveLoading(false)
    }
  }

  return {
    loading,
    saveLoading,
    hasProfile,
    isEditing,
    setIsEditing,
    isComplete,
    completionPct,
    openSections,
    formData,
    setFormData,
    errors,
    message,
    toggleSection,
    handleChange,
    handleSubmit,
    reload: fetchProfileData,
  }
}
