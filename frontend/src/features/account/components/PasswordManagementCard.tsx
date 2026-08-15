"use client"

import React from "react"
import { FiKey, FiLock, FiArrowRight } from "react-icons/fi"
import { Alert, Button, Card, Input } from "@/components/ui"

interface PasswordManagementCardProps {
  hasPassword: boolean
  currentPassword: string
  setCurrentPassword: (val: string) => void
  newPassword: string
  setNewPassword: (val: string) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  loading: boolean
  error: string | null
  successMessage: string | null
  handleSetupPassword: (e: React.FormEvent) => void
  handleChangePassword: (e: React.FormEvent) => void
}

export function PasswordManagementCard({
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
}: PasswordManagementCardProps) {
  return (
    <Card className="space-y-6">
      <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
        <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 shrink-0">
          <FiKey className="text-xl" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {hasPassword ? "Change Account Password" : "Create Student ID Login Password"}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            {hasPassword
              ? "Update your password for Student ID credential authentication."
              : "Create a password to enable Student ID login alongside Google authentication."}
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {successMessage && <Alert type="success" message={successMessage} />}

      {hasPassword ? (
        <form onSubmit={handleChangePassword} className="space-y-5">
          <Input
            label="Current Password"
            icon={<FiLock />}
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            disabled={loading}
          />

          <Input
            label="New Password"
            icon={<FiLock />}
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            disabled={loading}
          />

          <Input
            label="Confirm New Password"
            icon={<FiLock />}
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            disabled={loading}
          />

          <Button
            type="submit"
            loading={loading}
            icon={<FiArrowRight className="h-4 w-4" />}
            className="w-full justify-center py-3.5 text-xs font-extrabold uppercase tracking-widest"
          >
            Update Password
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSetupPassword} className="space-y-5">
          <Alert
            type="warning"
            message={
              <span>
                Setting a password allows you to log in using your <strong>Student ID</strong> in addition to <strong>Google OAuth</strong>. Both login methods access the exact same account.
              </span>
            }
          />

          <Input
            label="New Password"
            icon={<FiLock />}
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            icon={<FiLock />}
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            disabled={loading}
          />

          <Button
            type="submit"
            loading={loading}
            icon={<FiArrowRight className="h-4 w-4" />}
            className="w-full justify-center py-3.5 text-xs font-extrabold uppercase tracking-widest bg-emerald-700 hover:bg-emerald-800"
          >
            Create Password
          </Button>
        </form>
      )}
    </Card>
  )
}
