"use client"

import React from "react"
import PageTransition from "@/components/animations/PageTransition"
import Reveal from "@/components/animations/RevealOnScroll"
import { FiShield } from "react-icons/fi"
import { usePasswordManagement } from "../hooks/usePasswordManagement"
import { AccountIdentityCard } from "./AccountIdentityCard"
import { PasswordManagementCard } from "./PasswordManagementCard"

export default function AccountSettingsView() {
  const {
    auth,
    hasPassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    successMessage,
    handleSetupPassword,
    handleChangePassword,
  } = usePasswordManagement()

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <Reveal>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase tracking-wider mb-3">
                <FiShield className="text-cyan-600" /> Settings &amp; Security
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Manage your authentication, password, and account security preferences.
              </p>
            </div>
          </Reveal>

          {/* Card 1: Account Identity & Connected Identity */}
          <Reveal delay={40}>
            <AccountIdentityCard
              studentId={auth.studentId}
              role={auth.role}
              hasPassword={hasPassword}
            />
          </Reveal>

          {/* Card 2: Security & Password Management */}
          <Reveal delay={80}>
            <PasswordManagementCard
              hasPassword={hasPassword}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              loading={loading}
              error={error}
              successMessage={successMessage}
              handleSetupPassword={handleSetupPassword}
              handleChangePassword={handleChangePassword}
            />
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
