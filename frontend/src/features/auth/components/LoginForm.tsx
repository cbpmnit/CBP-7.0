"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { useLoginForm } from "../hooks/useLoginForm"
import { LoginFormSuccess } from "./LoginFormSuccess"
import { LoginFormFields } from "./LoginFormFields"

function LoginFormContent() {
  const {
    formData,
    loading,
    error,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleGoogleClick,
  } = useLoginForm()

  if (isSubmitted) {
    return <LoginFormSuccess identifier={formData.identifier} />
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
      {/* Header Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-100/60 py-16 sm:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal variant="up">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Login to <span className="gradient-text-cyan">CBP 7.0</span>
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3.5 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Enter your Student ID or Email Address and Password to access your portal, attendance records, and certificates.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <Reveal variant="up">
            <LoginFormFields
              formData={formData}
              loading={loading}
              error={error}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleGoogleClick={handleGoogleClick}
            />
          </Reveal>

          {/* Registration Hint */}
          <Reveal delay={120}>
            <div className="mt-6 text-center text-xs text-slate-600">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-bold text-cyan-700 hover:underline">
                Register here
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}

export default function LoginForm() {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-semibold">
            Loading portal login...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </PageTransition>
  )
}
