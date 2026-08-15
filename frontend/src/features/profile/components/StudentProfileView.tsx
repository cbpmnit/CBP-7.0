"use client"

import React from "react"
import Link from "next/link"
import { useAppSelector } from "@/store/hooks"
import { useStudentProfile } from "../hooks/useStudentProfile"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { IdentitySection } from "./sections/IdentitySection"
import { AcademicSection } from "./sections/AcademicSection"
import { ContactSection } from "./sections/ContactSection"
import { ResidenceSection } from "./sections/ResidenceSection"
import PageTransition from "@/components/animations/PageTransition"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import {
  FiUser,
  FiBookOpen,
  FiPhone,
  FiHome,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi"

export default function StudentProfileView() {
  const auth = useAppSelector((state) => state.auth)
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <FiArrowLeft /> Dashboard
          </Link>

          {hasProfile && isComplete && (
            <Button
              type="button"
              variant={isEditing ? "secondary" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
              className="gap-1.5"
            >
              <FiEdit /> {isEditing ? "View Profile" : "Edit Profile"}
            </Button>
          )}
        </div>

        {/* Profile Header Summary Card */}
        <ProfileHeaderCard
          displayName={displayName}
          studentId={formData.studentId || auth.studentId}
          email={auth.email}
          isComplete={isComplete}
          registrationEligible={registrationEligible}
          profileStatus={profileStatus}
          missingRequiredFields={missingRequiredFields}
          missingOptionalFields={missingOptionalFields}
        />

        {/* Success / Error Message Banner */}
        {message && (
          <Alert
            type={message.includes("saved") || message.includes("success") ? "success" : "error"}
            title={message.includes("saved") || message.includes("success") ? "Success" : "Notice"}
            message={message}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Identity */}
          <Card className="overflow-hidden p-0 border border-slate-200">
            <button
              type="button"
              onClick={() => toggleSection("identity")}
              className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
                <FiUser className="text-cyan-600 text-lg" />
                <span>Personal Identity</span>
              </div>
              {openSections.identity ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openSections.identity && (
              <div className="p-6">
                <IdentitySection
                  isEditing={isEditing}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>
            )}
          </Card>

          {/* Section 2: Academic Profile */}
          <Card className="overflow-hidden p-0 border border-slate-200">
            <button
              type="button"
              onClick={() => toggleSection("academic")}
              className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
                <FiBookOpen className="text-cyan-600 text-lg" />
                <span>Academic Profile</span>
              </div>
              {openSections.academic ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openSections.academic && (
              <div className="p-6">
                <AcademicSection
                  isEditing={isEditing}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>
            )}
          </Card>

          {/* Section 3: Contact & Communication */}
          <Card className="overflow-hidden p-0 border border-slate-200">
            <button
              type="button"
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
                <FiPhone className="text-cyan-600 text-lg" />
                <span>Contact Details</span>
              </div>
              {openSections.personal ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openSections.personal && (
              <div className="p-6">
                <ContactSection
                  isEditing={isEditing}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>
            )}
          </Card>

          {/* Section 4: Residence & Accommodation */}
          <Card className="overflow-hidden p-0 border border-slate-200">
            <button
              type="button"
              onClick={() => toggleSection("residence")}
              className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
                <FiHome className="text-cyan-600 text-lg" />
                <span>Residence & Accommodation</span>
              </div>
              {openSections.residence ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openSections.residence && (
              <div className="p-6">
                <ResidenceSection
                  isEditing={isEditing}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>
            )}
          </Card>

          {/* Submit / Save Actions */}
          {isEditing && (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={saveLoading}
                className="gap-2 px-8 py-3.5 text-sm uppercase tracking-wider"
              >
                <FiSave /> {saveLoading ? "Saving Details..." : "Save Profile Details"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </PageTransition>
  )
}
