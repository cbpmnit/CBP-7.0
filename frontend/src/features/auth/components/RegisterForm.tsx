"use client"

import React from "react"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi"
import { Input, Button, Alert, Card } from "@/components/ui"
import { useRegisterForm } from "../hooks/useRegisterForm"

export default function RegisterForm() {
  const {
    formData,
    loading,
    errors,
    message,
    isSuccess,
    handleChange,
    handleSubmit,
  } = useRegisterForm()

  const handleGoogleClick = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:9900"
    window.location.href = `${backendUrl}/api/v1/auth/google`
  }

  if (isSuccess) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="mx-auto max-w-md w-full text-center">
            <Reveal variant="scale">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
                <FiCheckCircle className="h-10 w-10" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
                Registration <span className="gradient-text-cyan">Successful!</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Your CBP 7.0 student account has been created. Redirecting to login portal...
              </p>
            </Reveal>
          </div>
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        <section className="bg-gradient-to-b from-white to-slate-100/60 py-16 sm:py-20 border-b border-slate-200 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Reveal variant="up">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Register for <span className="gradient-text-cyan">CBP 7.0</span>
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-3.5 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
                Create your student portal account to enroll in workshops, access daily attendance QR, and earn your certificate.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-lg px-4 sm:px-6">
            <Reveal variant="up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 sm:p-10 transition-all duration-300">
                  <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
                      <FiShield className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Create Account
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        MNIT Jaipur CBP Portal Registration
                      </p>
                    </div>
                  </div>

                  {message && (
                    <Alert type="error" message={message} className="mb-5" />
                  )}

                  <div className="space-y-4">
                    <Input
                      label="Student ID"
                      icon={<FiUser />}
                      required
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g. 2024UCH2277"
                      error={errors.studentId}
                    />

                    <Input
                      label="Full Name"
                      icon={<FiUser />}
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      error={errors.name}
                    />

                    <Input
                      label="MNIT Email Address"
                      icon={<FiMail />}
                      type="email"
                      required
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleChange}
                      placeholder="e.g. 2024uch2277@mnit.ac.in"
                      error={errors.studentEmail}
                    />

                    <Input
                      label="Phone Number"
                      icon={<FiPhone />}
                      type="tel"
                      required
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      error={errors.phoneNumber}
                    />

                    <Input
                      label="Password"
                      icon={<FiLock />}
                      type="password"
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      error={errors.password}
                    />

                    <Input
                      label="Confirm Password"
                      icon={<FiLock />}
                      type="password"
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      error={errors.confirmPassword}
                    />

                    <Button
                      type="submit"
                      loading={loading}
                      icon={<FiArrowRight className="h-4 w-4" />}
                      className="w-full justify-center py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 mt-2"
                    >
                      Create Account
                    </Button>

                    <div className="relative my-4 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Or continue with
                      </span>
                    </div>

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
                </Card>

                <div className="mt-6 text-center text-xs text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-cyan-700 hover:underline">
                    Login here
                  </Link>
                </div>
              </form>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
