"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import {
  adminStudentService,
  AdminFullStudentDetail,
  UpdateStudentProfilePayload,
} from "@/services/adminStudentService"
import {
  FiArrowLeft,
  FiUser,
  FiEdit,
  FiPrinter,
  FiSave,
  FiX,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiAward,
  FiAlertCircle,
  FiRefreshCw,
  FiShield,
  FiLock,
} from "react-icons/fi"

export default function AdminStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params?.id as string

  const [studentData, setStudentData] = useState<AdminFullStudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Edit Form Fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("MALE")
  const [dob, setDob] = useState("")
  const [course, setCourse] = useState("")
  const [branch, setBranch] = useState("")
  const [year, setYear] = useState("1")
  const [section, setSection] = useState("A")
  const [hosteller, setHosteller] = useState(false)
  const [roomNumber, setRoomNumber] = useState("")
  const [city, setCity] = useState("Jaipur")
  const [state, setState] = useState("Rajasthan")

  useEffect(() => {
    if (studentId) {
      fetchStudentDetail()
    }
  }, [studentId])

  const fetchStudentDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminStudentService.getStudentById(studentId)
      setStudentData(data)
      populateForm(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load complete student profile dossier.")
    } finally {
      setLoading(false)
    }
  }

  const populateForm = (data: AdminFullStudentDetail) => {
    const p = data.profile
    const names = data.student.name.split(" ")
    setFirstName(p.firstName || names[0] || "")
    setLastName(p.lastName || names.slice(1).join(" ") || "")
    setPhone(data.student.phone || "")
    setEmail(data.student.email || "")
    setGender(p.gender || "MALE")
    setDob(p.dob !== "Not specified" ? p.dob : "")
    setCourse(p.course || "")
    setBranch(p.branch || "")
    setYear(p.year || "1")
    setSection(p.section || "A")
    setHosteller(p.hosteller || false)
    setRoomNumber(p.roomNumber !== "-" ? p.roomNumber : "")
    setCity(p.city || "Jaipur")
    setState(p.state || "Rajasthan")
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    setError(null)

    const payload: UpdateStudentProfilePayload = {
      firstName,
      lastName,
      phone,
      email,
      gender,
      dob,
      course,
      branch,
      year,
      section,
      hosteller,
      roomNumber,
      city,
      state,
    }

    try {
      const updated = await adminStudentService.updateStudentProfile(studentId, payload)
      setStudentData(updated)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || "Failed to update student profile.")
    } finally {
      setSaving(false)
    }
  }

  const handlePrintPdf = async () => {
    try {
      await adminStudentService.downloadStudentPdf(studentId)
    } catch (err) {
      console.error("Failed to download PDF", err)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-72px)] flex items-center justify-center">
        <div className="text-center text-slate-500 space-y-2">
          <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading student profile dossier...</p>
        </div>
      </div>
    )
  }

  if (error || !studentData) {
    return (
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
        <SidebarNavigation />
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-xl text-amber-700 shrink-0" />
              <span className="text-xs font-semibold">{error || "Student not found."}</span>
            </div>
            <button
              onClick={() => router.push("/admin/students")}
              className="text-xs font-bold underline hover:text-amber-900"
            >
              Back to Directory
            </button>
          </div>
        </main>
      </div>
    )
  }

  const isPaid = studentData.payment.status === "SUCCESS"
  const isEligible = studentData.attendance.percentage >= 75.0

  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
      <SidebarNavigation />

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/admin/students")}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Back to Student Directory
            </button>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
              Student Profile Dossier
            </span>
          </div>

          {/* Profile Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="h-16 w-16 rounded-2xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-3xl shrink-0">
                <FiUser />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-xl font-extrabold text-white">{studentData.student.name}</h1>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                    {studentData.student.studentId}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {studentData.profile.course} in {studentData.profile.branch} • Year {studentData.profile.year}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handlePrintPdf}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5"
              >
                <FiPrinter /> Print Profile (PDF)
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5 ${
                  isEditing
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-cyan-600 hover:bg-cyan-700 text-white"
                }`}
              >
                {isEditing ? <FiX /> : <FiEdit />}
                <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <FiCheckCircle className="text-base text-emerald-600" />
              <span>Student profile details updated successfully!</span>
            </div>
          )}

          {/* MAIN PROFILE SECTIONS FORM */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* SECTION 1: Personal & Contact Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FiUser className="text-cyan-700 text-sm" /> 1. Personal & Contact Information
                </h3>
                {isEditing && <span className="text-[10px] font-extrabold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Editing Mode</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{firstName || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{lastName || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-mono text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{email || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-mono text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{phone || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{gender}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-mono text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{dob || "Not specified"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Academic & Hostel Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FiLayers className="text-cyan-700 text-sm" /> 2. Academic & Hostel Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{course || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{branch || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{year || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{section || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hosteller Status</label>
                  {isEditing ? (
                    <select
                      value={hosteller ? "true" : "false"}
                      onChange={(e) => setHosteller(e.target.value === "true")}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="true">Yes (Hosteller)</option>
                      <option value="false">No (Day Scholar)</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      {hosteller ? "Yes (Hosteller)" : "No (Day Scholar)"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{roomNumber || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{city || "Jaipur"}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">{state || "Rajasthan"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Action Bar (When in Editing Mode) */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <p className="text-xs text-amber-950 font-medium">
                  Review your changes above and click Save Profile Updates to commit updates.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <FiSave />
                    <span>{saving ? "Saving..." : "Save Profile Updates"}</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* SECTION 3: Payment Information (STRICTLY READ-ONLY) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FiCreditCard className="text-cyan-700 text-sm" /> 3. Payment Information (Read-Only)
              </h3>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                <FiLock /> Gateway Managed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Payment Status</span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-extrabold border ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {isPaid ? <FiCheckCircle /> : <FiClock />}
                  {studentData.payment.status}
                </span>
              </div>

              <div>
                <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Fee Amount</span>
                <p className="font-extrabold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  INR {studentData.payment.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">PhonePe Transaction ID</span>
                <p className="font-mono font-extrabold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150 truncate">
                  {studentData.payment.transactionId}
                </p>
              </div>

              <div>
                <span className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Paid At</span>
                <p className="font-mono text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  {studentData.payment.paidAt ? studentData.payment.paidAt.replace("T", " ").substring(0, 16) : "-"}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
              Note: Payment status and transaction details are strictly read-only and automatically verified via PhonePe webhook callbacks.
            </p>
          </div>

          {/* SECTION 4: Attendance & Certificate Status (READ-ONLY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-3 border-b border-slate-100">
                <FiClock className="text-cyan-700 text-sm" /> Attendance Tracker
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Total Workshop Sessions</span>
                  <span className="font-extrabold text-slate-900">{studentData.attendance.totalSessions}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Sessions Attended</span>
                  <span className="font-extrabold text-emerald-700">{studentData.attendance.attendedSessions}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-cyan-50/80 rounded-xl border border-cyan-200">
                  <span className="font-bold text-cyan-900">Attendance Percentage</span>
                  <span className="font-mono font-extrabold text-cyan-900 text-sm">
                    {studentData.attendance.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-3 border-b border-slate-100">
                <FiAward className="text-purple-700 text-sm" /> Certificate Credential Status
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">75% Threshold Status</span>
                  <span
                    className={`font-extrabold ${
                      isEligible ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {isEligible ? "ELIGIBLE ✓" : "NOT ELIGIBLE"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Certificate Status</span>
                  <span className="font-extrabold text-purple-700">{studentData.certificate.status}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50/80 rounded-xl border border-purple-200">
                  <span className="font-bold text-purple-900">Certificate Number</span>
                  <span className="font-mono font-extrabold text-purple-950">
                    {studentData.certificate.certificateNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
