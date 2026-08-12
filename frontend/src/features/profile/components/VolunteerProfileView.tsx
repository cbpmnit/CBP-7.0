"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useAppDispatch } from "@/store/hooks"
import { updateUserIdentity } from "@/store/slices/authSlice"
import {
  volunteerProfileService,
  VolunteerProfileDto,
  UpdateVolunteerProfileRequest,
} from "@/services/volunteerProfileService"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUser,
  FiBookOpen,
  FiEdit,
  FiCheckCircle,
  FiArrowLeft,
  FiSave,
  FiPhone,
  FiShield,
  FiAward,
} from "react-icons/fi"

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]
const VOLUNTEER_ROLES = [
  "Gate Volunteer",
  "Attendance Volunteer",
  "Coordinator",
  "Technical Support",
  "Stage & Speaker Usher",
]
const AVAILABILITY_OPTIONS = [
  "Full Program (All 5 Days)",
  "Day 1 - 2 Only",
  "Day 3 - 5 Only",
  "Emergency On-Call",
]
const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate / Research",
]

export default function VolunteerProfileView() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<VolunteerProfileDto>({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "MALE",
    profilePhotoUrl: "",
    college: "Malaviya National Institute of Technology Jaipur",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    studentId: "",
    volunteerRole: "Gate Volunteer",
    assignedResponsibilities: "Auditorium Gate 1 Scanner & Attendance Operations",
    availability: "Full Program (All 5 Days)",
    accountStatus: "ACTIVE",
    joinedDate: "August 2026",
    lastLogin: "Current Session",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await volunteerProfileService.getProfile()
      setFormData(data)
    } catch (err) {
      console.warn("Error loading volunteer profile", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (message) setMessage(null)
    if (error) setError(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setMessage(null)
    setError(null)

    if (!formData.fullName.trim()) {
      setError("Full Name is required.")
      setSaveLoading(false)
      return
    }

    try {
      const updatePayload: UpdateVolunteerProfileRequest = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        gender: formData.gender,
        profilePhotoUrl: formData.profilePhotoUrl,
        college: formData.college.trim(),
        course: formData.course.trim(),
        department: formData.department.trim(),
        year: formData.year,
        studentId: formData.studentId?.trim(),
        volunteerRole: formData.volunteerRole,
        assignedResponsibilities: formData.assignedResponsibilities.trim(),
        availability: formData.availability,
      }

      const updated = await volunteerProfileService.updateProfile(updatePayload)
      setFormData(updated)
      dispatch(updateUserIdentity({ name: updated.fullName, phoneNumber: updated.phoneNumber }))
      setIsEditing(false)
      setMessage("Volunteer profile details saved successfully ✓")
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please check the fields.")
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/volunteer/scanner"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <FiArrowLeft /> Back to Scanner
          </Link>
          <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
            Volunteer Profile
          </span>
        </div>

        {/* Feedback Alerts */}
        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
            <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5">
            <FiShield className="text-rose-600 text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <ProfileAvatar name={formData.fullName || "Volunteer"} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 truncate">
                  {formData.fullName || "Volunteer Member"}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-50 text-cyan-800 border border-cyan-200 shrink-0">
                  VOLUNTEER
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">{formData.email}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {formData.volunteerRole} &middot; {formData.department}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm ${
                isEditing
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <FiEdit /> {isEditing ? "Cancel" : "Edit Details"}
            </button>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Identity & Contact */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FiUser className="text-cyan-700" /> Identity &amp; Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email (Read-Only)
                </label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    disabled={!isEditing}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  disabled={!isEditing}
                  value={formData.studentId || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          </div>

          {/* Academic & Assignment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FiBookOpen className="text-cyan-700" /> Academic &amp; Assigned Responsibilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  disabled={!isEditing}
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Year
                </label>
                <select
                  name="year"
                  disabled={!isEditing}
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Volunteer Role
                </label>
                <select
                  name="volunteerRole"
                  disabled={!isEditing}
                  value={formData.volunteerRole}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                >
                  {VOLUNTEER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Program Availability
                </label>
                <select
                  name="availability"
                  disabled={!isEditing}
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                >
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assigned Duties
                </label>
                <textarea
                  rows={2}
                  name="assignedResponsibilities"
                  disabled={!isEditing}
                  value={formData.assignedResponsibilities}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {saveLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </main>
    </PageTransition>
  )
}
