"use client"

import { useState } from "react"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiMail, FiArrowRight, FiKey, FiCheckCircle, FiArrowLeft } from "react-icons/fi"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate / Trigger password reset notice
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        {/* Header Hero Section */}
        <section className="bg-gradient-to-b from-white to-slate-100/60 py-16 sm:py-20 border-b border-slate-200 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Reveal variant="up">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Reset Your <span className="gradient-text-cyan">Password</span>
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
                Enter your registered MNIT email address to receive password recovery instructions.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Reset Form Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <Reveal variant="up">
              {submitted ? (
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-3xl mb-4">
                    <FiCheckCircle />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Instructions Sent</h2>
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    If an account exists for <strong className="text-slate-900">{email}</strong>, a password reset link has been dispatched.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition"
                  >
                    <FiArrowLeft /> Back to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 transition-all duration-300">
                    <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
                        <FiKey className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Password Recovery
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Account Security &amp; Access
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          <FiMail className="text-cyan-600" />
                          Registered Email <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="e.g. student@mnit.ac.in"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                            <FiArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-600">
                    Remember your credentials?{" "}
                    <Link href="/login" className="font-bold text-cyan-700 hover:underline">
                      Login here
                    </Link>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
