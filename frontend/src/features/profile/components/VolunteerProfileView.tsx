"use client"

import React from "react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/ui/ProfileAvatar"
import PageTransition from "@/components/animations/PageTransition"
import { useVolunteerProfile } from "../hooks/useVolunteerProfile"
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
  const {
    loading,
    saveLoading,
    isEditing,
    setIsEditing,
    message,
    error,
    formData,
    handleChange,
    handleSubmit,
  } = useVolunteerProfile()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Loading Volunteer Profile...
          </span>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/volunteer/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-xs transition"
            >
              <FiArrowLeft /> Volunteer Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-xs transition"
            >
              <FiEdit /> {isEditing ? "View Profile" : "Edit Profile"}
            </button>
          </div>

          {/* Volunteer Identity Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <ProfileAvatar name={formData.fullName || "Volunteer"} size="lg" />
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">
                    {formData.fullName || "Volunteer User"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase">
                    <FiShield /> {formData.volunteerRole}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500">
                  Student ID: <span className="font-bold text-slate-900">{formData.studentId || "N/A"}</span>
                </p>
                <p className="text-xs text-slate-500 font-medium">{formData.email}</p>
              </div>
            </div>
          </div>

          {/* Feedback Banners */}
          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <FiCheckCircle className="text-base" /> {message}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FiUser className="text-cyan-600" /> Personal &amp; Academic Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-cyan-600 focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  disabled={!isEditing}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-cyan-600 focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  College / Institute
                </label>
                <input
                  type="text"
                  name="college"
                  disabled={!isEditing}
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-cyan-600 focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  disabled={!isEditing}
                  value={(formData.department as string) || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-cyan-600 focus:outline-none disabled:opacity-75"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 text-xs font-extrabold uppercase tracking-wider shadow-xs transition disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </PageTransition>
  )
}
