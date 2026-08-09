"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { volunteerService } from "@/services/volunteerService"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiShield,
  FiLock,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi"

function SetupPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Password Setup Form
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setValidToken(false)
      setStatusMessage("Missing invitation token. Please check your invitation link.")
      return
    }

    verifyToken(token)
  }, [token])

  const verifyToken = async (invitationToken: string) => {
    setVerifying(true)
    setStatusMessage(null)
    try {
      const res = await volunteerService.verifyInvitation(invitationToken)
      if (res.valid) {
        setValidToken(true)
        setEmail(res.email || "")
        setName(res.name || "")
      } else {
        setValidToken(false)
        setStatusMessage(res.message || "Invalid or expired volunteer invitation link.")
      }
    } catch (err: any) {
      setValidToken(false)
      setStatusMessage(err?.message || "Failed to verify invitation link.")
    } finally {
      setVerifying(false)
    }
  }

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.")
      return
    }

    setSubmitting(true)
    try {
      await volunteerService.setupPassword({
        token,
        password,
        confirmPassword,
      })
      setSuccessMessage("Account activated successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login?message=Volunteer account activated. Please log in.")
      }, 2000)
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to set up password. Token may have expired.")
    } finally {
      setSubmitting(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-3">
          <FiRefreshCw className="animate-spin text-3xl text-cyan-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Verifying Invitation Token...</h3>
          <p className="text-xs text-slate-500">Validating your CBP 7.0 volunteer onboarding credential.</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-1.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-center text-xl mx-auto shadow-md shadow-cyan-600/30">
              <FiShield />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Activate Volunteer Account
            </h1>
            <p className="text-xs text-slate-500">
              Set your personal password to activate volunteer gate scanner access for CBP 7.0.
            </p>
          </div>

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <FiCheckCircle className="text-base text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
              <FiAlertCircle className="text-base text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Token Invalid / Expired State */}
          {!validToken ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3 text-center">
              <FiAlertCircle className="text-3xl text-amber-600 mx-auto" />
              <h4 className="font-bold text-sm">Invitation Inactive or Expired</h4>
              <p className="text-slate-600">{statusMessage || "Please contact the CBP 7.0 administrator to request a new invitation."}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
              >
                <span>Go to Login</span> <FiArrowRight />
              </Link>
            </div>
          ) : (
            /* Password Activation Form */
            <form onSubmit={handleActivateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Volunteer Email (Assigned)
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold cursor-not-allowed"
                  />
                </div>
                {name && <p className="text-[11px] text-slate-500 mt-1 font-medium">Invited Name: {name}</p>}
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm shadow-cyan-600/20 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />}
                <span>{submitting ? "Activating Account..." : "Activate Account"}</span>
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/login"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition inline-flex items-center gap-1"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SetupPasswordContent />
    </Suspense>
  )
}
