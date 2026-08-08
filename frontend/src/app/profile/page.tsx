"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ApiError } from "@/utils/api"
import { profileService } from "@/services/profileService"
import { UserProfileRequest } from "@/types/profile"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUser,
  FiBookOpen,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiArrowLeft,
  FiSave,
  FiHome,
  FiCalendar,
  FiPhone,
  FiInfo,
} from "react-icons/fi"

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]
const COURSES = ["BTECH", "MTECH", "MBA"]
const BRANCHES = [
  "CHEMICAL_ENGINEERING",
  "COMPUTER_SCIENCE_ENGINEERING",
  "CIVIL_ENGINEERING",
  "MECHANICAL_ENGINEERING",
  "ELECTRICAL_ENGINEERING",
  "ELECTRONICS_COMMUNICATION",
  "METALLURGICAL_ENGINEERING",
  "ARCHITECTURE",
  "ARTIFICIAL_INTELLIGENCE_DATA_SCIENCE",
  "MATERIALS_ENGINEERING",
  "MANAGEMENT_STUDIES",
  "OTHER",
]

export default function ProfilePage() {
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

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const [profData, compData] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getCompletion(),
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

      // If profile does not exist OR profile is incomplete (< 100%), automatically open edit form
      if (!profileExists || !completed || percentage < 100) {
        setIsEditing(true)
      } else {
        setIsEditing(false)
      }
    } catch (err: any) {
      setIsEditing(true)
      setHasProfile(false)
    } finally {
      setLoading(false)
    }
  }

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

    // Validation checks matching backend constraints
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
        await profileService.updateProfile(payload)
      } else {
        await profileService.createProfile(payload)
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Loading Profile...
          </span>
        </div>
      </div>
    )
  }

  const displayName = `${formData.firstName} ${formData.lastName}`.trim() || "Student Profile"

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>

            {hasProfile && isComplete && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
              >
                <FiEdit /> {isEditing ? "View Profile" : "Edit Profile"}
              </button>
            )}
          </div>

          {/* Header Card / First-Time Alert */}
          {(!hasProfile || !isComplete) && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-lg shrink-0">
                  <FiInfo />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Complete your profile</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Please fill out your personal, academic, and contact details below to finalize your CBP 7.0 workshop registration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Student Identity Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 cbp-card-interactive">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="shrink-0">
                <ProfileAvatar name={displayName} size="lg" />
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 truncate">{displayName}</h1>
                    <p className="text-xs font-mono text-cyan-800 font-bold mt-0.5">
                      {formData.institute}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formData.course} in {formData.branch.replace(/_/g, " ")} &middot; Year {formData.year}
                    </p>
                  </div>
                  {isComplete ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 self-center sm:self-auto">
                      <FiCheckCircle /> Profile Complete (100%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0 self-center sm:self-auto">
                      Incomplete ({completionPct}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Alerts / Feedback */}
          {message && (
            <div className="p-4 mb-6 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GROUP 1: Identity / Personal Name */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("identity")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-cyan-700 text-base"><FiUser /></span>
                  <span>1. Student Identity Details</span>
                </h2>
                {openSections.identity ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.identity && (
                <div className="p-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      disabled={!isEditing}
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                    {errors.firstName && <p className="text-[11px] text-red-600 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      disabled={!isEditing}
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      disabled={!isEditing}
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Sharma"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                    {errors.lastName && <p className="text-[11px] text-red-600 mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 2: Academic Information */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("academic")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-blue-700 text-base"><FiBookOpen /></span>
                  <span>2. Academic &amp; Enrollment Information</span>
                </h2>
                {openSections.academic ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.academic && (
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">College / Institute</label>
                    <input
                      type="text"
                      name="institute"
                      disabled={!isEditing}
                      value={formData.institute}
                      onChange={handleChange}
                      placeholder="MNIT Jaipur"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Course / Program <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course"
                      disabled={!isEditing}
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="branch"
                      disabled={!isEditing}
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>{b.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="year"
                        min="1"
                        max="5"
                        disabled={!isEditing}
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                      <input
                        type="text"
                        name="section"
                        disabled={!isEditing}
                        value={formData.section}
                        onChange={handleChange}
                        placeholder="e.g. A"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 3: Personal & Contact Details */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("personal")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-emerald-700 text-base"><FiCalendar /></span>
                  <span>3. Personal &amp; Contact Information</span>
                </h2>
                {openSections.personal ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.personal && (
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      disabled={!isEditing}
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      disabled={!isEditing}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      disabled={!isEditing}
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-mono"
                    />
                    {errors.phoneNumber && <p className="text-[11px] text-red-600 mt-1">{errors.phoneNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sameAsWhatsapp"
                          disabled={!isEditing}
                          checked={formData.sameAsWhatsapp}
                          onChange={handleChange}
                          className="rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>Same as phone number</span>
                      </label>
                      {!formData.sameAsWhatsapp && (
                        <input
                          type="tel"
                          name="whatsappNumber"
                          disabled={!isEditing}
                          value={formData.whatsappNumber}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-mono"
                        />
                      )}
                    </div>
                    {errors.whatsappNumber && <p className="text-[11px] text-red-600 mt-1">{errors.whatsappNumber}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 4: Hostel & Location */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("hostel")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-amber-700 text-base"><FiHome /></span>
                  <span>4. Hostel &amp; Location</span>
                </h2>
                {openSections.hostel ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.hostel && (
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Residence Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="hosteller"
                      disabled={!isEditing}
                      value={formData.hosteller ? "true" : "false"}
                      onChange={(e) => {
                        const isH = e.target.value === "true"
                        setFormData((prev) => ({ ...prev, hosteller: isH }))
                      }}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      <option value="false">Day Scholar</option>
                      <option value="true">Hosteller</option>
                    </select>
                  </div>
                  {formData.hosteller && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hostel / Room Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        disabled={!isEditing}
                        required={formData.hosteller}
                        value={formData.roomNumber}
                        onChange={handleChange}
                        placeholder="e.g. H3-102"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                      />
                      {errors.roomNumber && <p className="text-[11px] text-red-600 mt-1">{errors.roomNumber}</p>}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      disabled={!isEditing}
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Jaipur"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      disabled={!isEditing}
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Rajasthan"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiSave className="text-sm" />
                <span>{saveLoading ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            )}
          </form>
        </div>
      </main>
    </PageTransition>
  )
}
