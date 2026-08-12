"use client"

import React from "react"
import Link from "next/link"
import { useStudentProfile } from "../hooks/useStudentProfile"
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

export default function StudentProfileView() {
  const {
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
  } = useStudentProfile()

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
      <div className="space-y-4">
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
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 self-center sm:self-auto shadow-xs">
                      <FiCheckCircle className="text-emerald-600 text-sm" /> Status: COMPLETED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0 self-center sm:self-auto shadow-xs">
                      <FiInfo className="text-amber-600 text-sm" /> Status: INCOMPLETE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Readiness Banner */}
          {isComplete ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-emerald-600 text-xl shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">CBP Registration Ready</h3>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    All required profile details are completed. You can now register for the CBP 7.0 workshop and proceed to fee payment.
                  </p>
                </div>
              </div>
              <Link
                href="/cbp"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-xs transition shrink-0 self-end sm:self-auto"
              >
                Register Now &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 mb-6 shadow-xs">
              <div className="flex items-start gap-3">
                <FiInfo className="text-amber-600 text-xl shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Action Required Before Registration</h3>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    Please complete all required profile details below to enable CBP program registration and fee payment.
                  </p>
                  {missingRequiredFields && missingRequiredFields.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-900">Missing Required Details:</span>
                      {missingRequiredFields.map((field) => (
                        <span key={field} className="px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">
                          {field}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Message */}
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
                    {errors.firstName && (
                      <span className="text-[11px] font-bold text-rose-600 mt-0.5 block">{errors.firstName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Middle Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      disabled={!isEditing}
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="e.g. Kumar"
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
                    {errors.lastName && (
                      <span className="text-[11px] font-bold text-rose-600 mt-0.5 block">{errors.lastName}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 2: Academic Program */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("academic")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-cyan-700 text-base"><FiBookOpen /></span>
                  <span>2. Academic Enrollment</span>
                </h2>
                {openSections.academic ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.academic && (
                <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institute / College <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="institute"
                      disabled={!isEditing}
                      required
                      value={formData.institute}
                      onChange={handleChange}
                      placeholder="e.g. Malaviya National Institute of Technology Jaipur"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course"
                      disabled={!isEditing}
                      required
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
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="year"
                      min={1}
                      max={5}
                      disabled={!isEditing}
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Branch / Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="branch"
                      disabled={!isEditing}
                      required
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>{b.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Section <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="section"
                      disabled={!isEditing}
                      value={formData.section}
                      onChange={handleChange}
                      placeholder="e.g. Section A"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 3: Personal & Contact Information */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("personal")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-cyan-700 text-base"><FiCalendar /></span>
                  <span>3. Personal &amp; Contact Information</span>
                </h2>
                {openSections.personal ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.personal && (
                <div className="p-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      disabled={!isEditing}
                      required
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      disabled={!isEditing}
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      disabled={!isEditing}
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                    />
                    {errors.phoneNumber && (
                      <span className="text-[11px] font-bold text-rose-600 mt-0.5 block">{errors.phoneNumber}</span>
                    )}
                  </div>

                  <div className="sm:col-span-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="sameAsWhatsapp"
                        disabled={!isEditing}
                        checked={formData.sameAsWhatsapp}
                        onChange={handleChange}
                        className="rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-xs font-bold text-slate-700">WhatsApp number same as mobile number</span>
                    </label>
                  </div>

                  {!formData.sameAsWhatsapp && (
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        disabled={!isEditing}
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        placeholder="10-digit WhatsApp number"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GROUP 4: Residence & Hostel Details */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("hostel")}
                className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left"
              >
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-cyan-700 text-base"><FiHome /></span>
                  <span>4. Residence Details</span>
                </h2>
                {openSections.hostel ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {openSections.hostel && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hosteller"
                        disabled={!isEditing}
                        checked={formData.hosteller}
                        onChange={handleChange}
                        className="rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-xs font-bold text-slate-700">I am currently staying in a campus hostel</span>
                    </label>
                  </div>

                  {formData.hosteller && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hostel Room Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        disabled={!isEditing}
                        required={formData.hosteller}
                        value={formData.roomNumber}
                        onChange={handleChange}
                        placeholder="e.g. H-101 or Hostel 5 Room 204"
                        className="w-full sm:w-1/2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none disabled:opacity-80 font-medium"
                      />
                      {errors.roomNumber && (
                        <span className="text-[11px] font-bold text-rose-600 mt-0.5 block">{errors.roomNumber}</span>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Home City <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Home State <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
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
                </div>
              )}
            </div>

            {/* Save Form Actions */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                >
                  <FiSave className="text-sm" /> {saveLoading ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            )}
          </form>
      </div>
    </PageTransition>
  )
}
