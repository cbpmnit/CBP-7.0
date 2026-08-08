"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api, ApiError } from "@/utils/api"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceQrResponse } from "@/types/attendance"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUser,
  FiBookOpen,
  FiMapPin,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiArrowLeft,
  FiSave,
  FiHome,
  FiCalendar,
  FiCode,
  FiCopy,
  FiCheck,
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
  const [isEditing, setIsEditing] = useState(false)
  const [qrCode, setQrCode] = useState<AttendanceQrResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const [openSections, setOpenSections] = useState({
    identity: true,
    academic: true,
    personal: true,
    hostel: true,
    qr: true,
  })

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    profilePhotoUrl: "",
    gender: "MALE",
    dateOfBirth: "",
    phoneNumber: "",
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
      const [profData, qrData] = await Promise.allSettled([
        api.get("/api/v1/profile/me"),
        attendanceService.getMyQr(),
      ])

      if (profData.status === "fulfilled" && profData.value) {
        const data: any = profData.value
        setFormData({
          firstName: data.firstName || "",
          middleName: data.middleName || "",
          lastName: data.lastName || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
          gender: data.gender || "MALE",
          dateOfBirth: data.dateOfBirth || "",
          phoneNumber: data.phoneNumber || "",
          whatsappNumber: data.whatsappNumber || "",
          institute: data.institute || "MNIT Jaipur",
          course: data.course || "BTECH",
          branch: data.branch || "COMPUTER_SCIENCE_ENGINEERING",
          year: data.year || 1,
          section: data.section || "",
          hosteller: data.hosteller || false,
          roomNumber: data.roomNumber || "",
          city: data.city || "",
          state: data.state || "",
        })
      }
      if (qrData.status === "fulfilled") {
        setQrCode(qrData.value)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setIsEditing(true)
      } else {
        setMessage("Failed to load profile details")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sec: "identity" | "academic" | "personal" | "hostel" | "qr") => {
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
        ? parseInt(value) || 0
        : value

    setFormData((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleCopyToken = () => {
    if (!qrCode?.token) return
    navigator.clipboard.writeText(qrCode.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setErrors({})
    setMessage(null)

    try {
      await api.put("/api/v1/profile", formData)
      setMessage("Profile details saved successfully!")
      setIsEditing(false)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorData?.errors) {
          setErrors(err.errorData.errors)
        } else {
          setMessage(err.message || "Failed to save profile")
        }
      } else {
        setMessage("An unexpected error occurred.")
      }
    } finally {
      setSaveLoading(false)
    }
  }

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || "Student Profile"

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiEdit /> {isEditing ? "View Profile" : "Edit Profile"}
            </button>
          </div>

          {/* Student Identity Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 cbp-card-interactive">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <ProfileAvatar name={fullName} size="lg" />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{fullName}</h1>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {formData.course} in {formData.branch.replace(/_/g, " ")} &middot; Year {formData.year}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 self-center sm:self-auto">
                    <FiCheckCircle /> Profile Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold text-center mb-6 ${
                message.includes("success")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GROUP 1: Student Identity */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("identity")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-cyan-700 text-base"><FiUser /></span>
                  <span>1. Student Identity</span>
                </h2>
                {openSections.identity ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.identity && (
                <div className="p-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      disabled={!isEditing}
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      disabled={!isEditing}
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      disabled={!isEditing}
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 2: Academic Details */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("academic")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-blue-700 text-base"><FiBookOpen /></span>
                  <span>2. Academic Information</span>
                </h2>
                {openSections.academic ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.academic && (
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Institute</label>
                    <input
                      type="text"
                      name="institute"
                      disabled={!isEditing}
                      value={formData.institute}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course / Program</label>
                    <select
                      name="course"
                      disabled={!isEditing}
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department / Branch</label>
                    <select
                      name="branch"
                      disabled={!isEditing}
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study</label>
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
                </div>
              )}
            </div>

            {/* GROUP 3: Personal Details */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("personal")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-emerald-700 text-base"><FiCalendar /></span>
                  <span>3. Personal Information</span>
                </h2>
                {openSections.personal ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.personal && (
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      disabled={!isEditing}
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g.replace(/_/g, " ")}
                        </option>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      disabled={!isEditing}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      disabled={!isEditing}
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 4: Profile QR Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("qr")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-purple-700 text-base"><FiCode /></span>
                  <span>4. Student Verification QR</span>
                </h2>
                {openSections.qr ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.qr && (
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {qrCode ? (
                    <>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
                        <img
                          src={qrCode.qrImageBase64}
                          alt="Student Verification QR"
                          className="w-36 h-36"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">Official Student Identity QR Payload</h4>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          This QR code is uniquely encrypted for your student registration profile. Volunteers scan this payload at program venues.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 truncate max-w-xs">
                            {qrCode.token}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyToken}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold hover:bg-cyan-100 transition shrink-0"
                          >
                            {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                            <span>{copied ? "Copied" : "Copy Payload"}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">QR Payload loading...</p>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
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
