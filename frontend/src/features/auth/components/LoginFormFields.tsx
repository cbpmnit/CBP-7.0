"use client"

import React from "react"
import Link from "next/link"
import { FiUser, FiLock, FiArrowRight, FiShield } from "react-icons/fi"
import { Input, Button, Alert } from "@/components/ui"

interface LoginFormFieldsProps {
  formData: {
    identifier: string
    password: string
    rememberMe: boolean
  }
  loading: boolean
  error: string | null
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  handleGoogleClick: () => void
}

export function LoginFormFields({
  formData,
  loading,
  error,
  handleChange,
  handleSubmit,
  handleGoogleClick,
}: LoginFormFieldsProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 transition-all duration-300">
        <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
            <FiShield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Account Portal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              MNIT Jaipur Single Sign-On
            </p>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-5" />
        )}

        <div className="space-y-5">
          {/* Student ID / Email */}
          <Input
            label="STUDENT ID / EMAIL"
            icon={<FiUser />}
            required
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="Enter Student ID or Email Address"
          />

          {/* Password */}
          <div>
            <Input
              label="PASSWORD"
              icon={<FiLock />}
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-1">
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-cyan-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Remember my Student ID / Email</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            loading={loading}
            icon={<FiArrowRight className="h-4 w-4" />}
            className="w-full justify-center py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30"
          >
            Login to Portal
          </Button>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or continue with
            </span>
          </div>

          {/* Google OAuth Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleClick}
            className="w-full justify-center py-3.5 text-xs font-bold text-slate-800 border-slate-200 hover:bg-slate-50"
            icon={
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            }
          >
            Continue with Google
          </Button>
        </div>
      </div>
    </form>
  )
}
