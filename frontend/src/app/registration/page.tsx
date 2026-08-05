"use client"

import { useState } from "react"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

type Step = "form" | "success"

export default function RegistrationPage() {
  const [step, setStep] = useState<Step>("form")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    department: "",
    year: "1st Year",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("success")
  }

  if (step === "success") {
    return (
      <PageTransition>
        <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber">
          <section className="flex min-h-[60vh] items-center justify-center py-20">
            <div className="mx-auto max-w-lg px-5 text-center">
              <Reveal>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                  ✓
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-6 text-3xl font-extrabold text-white">
                  Registration <span className="gradient-text-cyan">Successful!</span>
                </h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Welcome, <strong className="text-cyan-300 font-semibold">{formData.name}</strong>!
                  Your registration for CBP 7.0 has been received. A confirmation
                  email will be sent to{" "}
                  <strong className="text-cyan-300 font-semibold">{formData.email}</strong> with
                  the program schedule, payment details, and further instructions.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 glass-card rounded-2xl p-6 text-left border-cyan-500/30">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
                    Registration Summary
                  </p>
                  <dl className="space-y-3 text-sm">
                    {[
                      ["Name", formData.name],
                      ["Email", formData.email],
                      ["Roll Number", formData.rollNumber],
                      ["Department", formData.department],
                      ["Year", formData.year],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                        <dt className="text-gray-400 font-mono text-xs">{label}</dt>
                        <dd className="font-bold text-white text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  href="/"
                  className="mt-8 inline-flex items-center justify-center rounded-xl neon-button-cyan px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider"
                >
                  Back to Home
                </Link>
              </Reveal>
            </div>
          </section>
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber">
        <section className="bg-black py-24 sm:py-32 relative overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                Join CBP 7.0
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Register for <span className="gradient-text-cyan">CBP 7.0</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-300">
                Fill in your details below to secure your spot in the 5-day
                Capacity Building Program at MNIT Jaipur.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-5 lg:px-8">
            <Reveal>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card rounded-3xl p-8 sm:p-10 border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-black text-sm font-extrabold shadow-[0_0_15px_#00f0ff]">
                      1
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white">
                        Personal Information
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        Please use your official MNIT credentials.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="Enter your full name as per records"
                      />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                          MNIT Email <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          placeholder="you@mnit.ac.in"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Roll Number <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="rollNumber"
                          required
                          value={formData.rollNumber}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          placeholder="e.g. 2024XXXXX"
                        />
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Department <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Year of Study
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl neon-button-cyan py-4 text-sm font-extrabold uppercase tracking-wider"
                >
                  Complete Registration
                </button>

                <p className="text-center text-xs text-gray-400 font-mono">
                  By registering, you agree to the terms and conditions of the
                  CBP 7.0 program at MNIT Jaipur.
                </p>
              </form>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
