"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateUserIdentity } from "@/store/slices/authSlice"
import { validateAndSyncSession } from "@/features/auth/services/authSync"
import { profileApi } from "../services/profileApi"
import { UserProfileRequest, StudentType, ProgramLevel } from "../types"
import { ApiError } from "@/utils/api"

export function useStudentProfile() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [registrationEligible, setRegistrationEligible] = useState(false)
  const [profileStatus, setProfileStatus] = useState<"COMPLETED" | "INCOMPLETE">("INCOMPLETE")
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([])
  const [missingOptionalFields, setMissingOptionalFields] = useState<string[]>([])

  const [openSections, setOpenSections] = useState({
    identity: true,
    academic: true,
    personal: true,
    residence: true,
  })

  const [formData, setFormData] = useState<{
    studentId: string
    firstName: string
    middleName: string
    lastName: string
    profilePhotoUrl: string
    gender: string
    dateOfBirth: string
    phoneNumber: string
    sameAsWhatsapp: boolean
    whatsappNumber: string
    institute: string
    programLevel: ProgramLevel
    department: string
    year: number
    section: string
    studentType: StudentType
    address: string
    hostelNumber: string
    roomNumber: string
    city: string
    state: string
  }>({
    studentId: auth.studentId || "",
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
    programLevel: "UNDERGRADUATE",
    department: "Computer Science and Engineering",
    year: 1,
    section: "",
    studentType: "DAY_SCHOLAR",
    address: "",
    hostelNumber: "",
    roomNumber: "",
    city: "",
    state: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const hasInitializedRef = useRef(false)

  const fetchProfileData = useCallback(async () => {
    setLoading(true)
    try {
      const [profData, compData] = await Promise.allSettled([
        profileApi.getProfile(),
        profileApi.getCompletion(),
      ])

      let profileExists = false
      let eligible = false

      if (compData.status === "fulfilled" && compData.value) {
        const val = compData.value
        eligible = Boolean(val.registrationEligible || val.completed || val.profileStatus === "COMPLETED")
        setRegistrationEligible(eligible)
        setIsComplete(eligible)
        setProfileStatus(eligible ? "COMPLETED" : "INCOMPLETE")
        setMissingRequiredFields(val.missingRequiredFields || val.missingMandatoryFields || [])
        setMissingOptionalFields(val.missingOptionalFields || [])
      }

      if (profData.status === "fulfilled" && profData.value) {
        profileExists = true
        setHasProfile(true)
        const data = profData.value
        const resolvedStudentType: StudentType = data.studentType
          ? data.studentType
          : data.hosteller
          ? "HOSTELLER"
          : "DAY_SCHOLAR"

        if (!hasInitializedRef.current) {
          setFormData((prev) => ({
            ...prev,
            studentId: auth.studentId || "",
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
            programLevel: data.programLevel || ((data as any).course as ProgramLevel) || "UNDERGRADUATE",
            department: data.department || (data as any).branch || "Computer Science and Engineering",
            year: data.year || 1,
            section: data.section || "",
            studentType: resolvedStudentType,
            address: data.address || "",
            hostelNumber: data.hostelNumber || "",
            roomNumber: data.roomNumber || "",
            city: data.city || "",
            state: data.state || "",
          }))
          hasInitializedRef.current = true
        }

        const verifiedFullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ").trim()
        if (verifiedFullName && verifiedFullName !== auth.name) {
          dispatch(updateUserIdentity({ name: verifiedFullName, phoneNumber: data.phoneNumber }))
        }
      } else {
        setHasProfile(false)

        if (!hasInitializedRef.current) {
          const rawName = (auth.name || (typeof window !== "undefined" && localStorage.getItem("cbp-name")) || "").trim()
          let prefilledFirst = ""
          let prefilledLast = ""

          if (rawName) {
            const parts = rawName.split(/\s+/)
            prefilledFirst = parts[0] || ""
            prefilledLast = parts.length > 1 ? parts.slice(1).join(" ") : ""
          }

          setFormData((prev) => ({
            ...prev,
            studentId: auth.studentId || "",
            firstName: prefilledFirst,
            lastName: prefilledLast,
          }))
          hasInitializedRef.current = true
        }
      }

      if (!profileExists || !eligible) {
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
  }, [auth.name, auth.studentId, dispatch])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const toggleSection = (sec: "identity" | "academic" | "personal" | "residence") => {
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
        : name === "year"
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

    const isHosteller = formData.studentType === "HOSTELLER"

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
      programLevel: formData.programLevel || "UNDERGRADUATE",
      department: formData.department || "Computer Science and Engineering",
      year: Number(formData.year) || 1,
      section: formData.section && formData.section.trim() ? formData.section.trim() : null,
      studentType: formData.studentType,
      address: !isHosteller && formData.address && formData.address.trim() ? formData.address.trim() : null,
      hostelNumber: isHosteller && formData.hostelNumber && formData.hostelNumber.trim() ? formData.hostelNumber.trim() : null,
      hosteller: isHosteller,
      roomNumber: isHosteller && formData.roomNumber && formData.roomNumber.trim() ? formData.roomNumber.trim() : null,
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

    const numericYear = Number(formData.year)
    if (!numericYear || numericYear < 1 || numericYear > 5) {
      newErrors.year = "Year of study must be between 1 and 5"
    }

    if (formData.studentType === "DAY_SCHOLAR") {
      if (!formData.address || !formData.address.trim()) {
        newErrors.address = "Address is required for Day Scholars"
      }
    } else if (formData.studentType === "HOSTELLER") {
      if (!formData.hostelNumber || !formData.hostelNumber.trim()) {
        newErrors.hostelNumber = "Hostel number is required for Hostellers"
      }
      if (!formData.roomNumber || !formData.roomNumber.trim()) {
        newErrors.roomNumber = "Room number is required for Hostellers"
      }
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

      const newFullName = [formData.firstName, formData.middleName, formData.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()

      dispatch(updateUserIdentity({ name: newFullName, phoneNumber: formData.phoneNumber }))
      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-name", newFullName)
      }

      await validateAndSyncSession()

      setMessage("Profile details saved successfully!")
      setHasProfile(true)
      setIsEditing(false)
      hasInitializedRef.current = false
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
    registrationEligible,
    profileStatus,
    missingRequiredFields,
    missingOptionalFields,
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
