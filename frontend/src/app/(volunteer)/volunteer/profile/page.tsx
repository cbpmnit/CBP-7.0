"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiArrowLeft,
  FiSave,
  FiPhone,
  FiShield,
  FiClock,
  FiAward,
  FiLock,
  FiCamera,
  FiCalendar,
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

export default function VolunteerProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [openSections, setOpenSections] = useState({
    identity: true,
    academic: true,
    volunteer: true,
    account: true,
  })

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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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
      <div className="flex-1 w-full min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/volunteer/scanner"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Back to Scanner
            </Link>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
              Volunteer Dossier
            </span>
          </div>

          {/* Messages */}
          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
              <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <FiShield className="text-rose-600 text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Volunteer Header Profile Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <ProfileAvatar name={formData.fullName || "Volunteer"} size="lg" />
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {formData.fullName || "Volunteer Member"}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    VOLUNTEER
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{formData.email}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 font-medium">
                  <span>Role: <strong className="text-slate-900">{formData.volunteerRole}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong className="text-slate-900">{formData.department}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 shadow-sm ${
                  isEditing
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-cyan-600/20"
                }`}
              >
                <FiEdit /> {isEditing ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Volunteer Identity Details */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection("identity")}
                className="w-full px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-base">
                    <FiUser />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      1. Volunteer Identity Details
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Personal identity & contact information</p>
                  </div>
                </div>
                {openSections.identity ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
              </button>

              {openSections.identity && (
                <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name <span className="text-cyan-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      disabled={!isEditing}
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Parva Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  {/* Email (Read Only) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address (Read-Only)
                    </label>
                    <input
                      type="email"
                      name="email"
                      disabled
                      value={formData.email}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        disabled={!isEditing}
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      name="gender"
                      disabled={!isEditing}
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Profile Photo URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Profile Photo URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="profilePhotoUrl"
                      disabled={!isEditing}
                      value={formData.profilePhotoUrl || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Academic / Organization Details */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection("academic")}
                className="w-full px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-base">
                    <FiBookOpen />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      2. Academic / Organization Details
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Department, university & academic standing</p>
                  </div>
                </div>
                {openSections.academic ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
              </button>

              {openSections.academic && (
                <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* College / Institute */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      College / Institute
                    </label>
                    <input
                      type="text"
                      name="college"
                      disabled={!isEditing}
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="e.g. Malaviya National Institute of Technology Jaipur"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  {/* Student ID (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      disabled={!isEditing}
                      value={formData.studentId || ""}
                      onChange={handleChange}
                      placeholder="e.g. 2024UCP1186"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  {/* Course / Program */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Course / Program
                    </label>
                    <input
                      type="text"
                      name="course"
                      disabled={!isEditing}
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech / M.Tech"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      disabled={!isEditing}
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science & Eng."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Academic Year
                    </label>
                    <select
                      name="year"
                      disabled={!isEditing}
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Volunteer Information */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection("volunteer")}
                className="w-full px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-base">
                    <FiAward />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      3. Volunteer Information & Responsibilities
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Assigned duties & session availability</p>
                  </div>
                </div>
                {openSections.volunteer ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
              </button>

              {openSections.volunteer && (
                <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Volunteer Role */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Volunteer Role
                    </label>
                    <select
                      name="volunteerRole"
                      disabled={!isEditing}
                      value={formData.volunteerRole}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    >
                      {VOLUNTEER_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Program Availability
                    </label>
                    <select
                      name="availability"
                      disabled={!isEditing}
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    >
                      {AVAILABILITY_OPTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Responsibilities */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Assigned Responsibilities / Duties
                    </label>
                    <textarea
                      rows={2}
                      name="assignedResponsibilities"
                      disabled={!isEditing}
                      value={formData.assignedResponsibilities}
                      onChange={handleChange}
                      placeholder="e.g. Auditorium Gate 1 QR Attendance Scanning, student validation, and query assistance."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 disabled:bg-slate-100/70 disabled:text-slate-600 focus:bg-white focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Account Information */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection("account")}
                className="w-full px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-base">
                    <FiShield />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      4. Account & Security Information
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Status, audit timestamps & security</p>
                  </div>
                </div>
                {openSections.account ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
              </button>

              {openSections.account && (
                <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Account Status</span>
                    <p className="text-xs font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
                      <FiCheckCircle /> {formData.accountStatus || "ACTIVE"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Joined Date</span>
                    <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                      <FiCalendar className="text-slate-400" /> {formData.joinedDate || "August 2026"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Session Status</span>
                    <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                      <FiClock className="text-slate-400" /> {formData.lastLogin || "Authenticated"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 shadow-sm shadow-cyan-600/20 disabled:opacity-50"
                >
                  {saveLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
                  <span>Save Volunteer Profile</span>
                </button>
              </div>
            )}
          </form>
        </main>
    </PageTransition>
  )
}
