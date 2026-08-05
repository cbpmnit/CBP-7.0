"use client"

import { useState } from "react"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUser,
  FiMail,
  FiHash,
  FiBookOpen,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi"

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
        <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8">
          <section className="flex min-h-[65vh] items-center justify-center">
            <div className="mx-auto max-w-xl w-full text-center">
              <Reveal variant="scale">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
                  <FiCheckCircle className="h-10 w-10" />
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  Registration <span className="gradient-text-cyan">Successful!</span>
                </h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Welcome, <strong className="text-cyan-700 font-semibold">{formData.name}</strong>!
                  Your registration for CBP 7.0 has been received. A confirmation
                  email will be sent to{" "}
                  <strong className="text-cyan-700 font-semibold">{formData.email}</strong> with
                  the program schedule, payment details, and further instructions.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 text-left border border-slate-200 shadow-xl shadow-slate-200/50">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-700 mb-4 flex items-center gap-2">
                    Registration Summary
                  </p>
                  <dl className="space-y-3.5 text-sm">
                    {[
                      ["Full Name", formData.name],
                      ["MNIT Email", formData.email],
                      ["Roll Number", formData.rollNumber],
                      ["Department", formData.department],
                      ["Year of Study", formData.year],
                      ["Phone Number", formData.phone || "Not provided"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center gap-4 border-b border-slate-100 pb-2.5">
                        <dt className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</dt>
                        <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  href="/"
                  className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5"
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
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {/* Header Hero Section */}
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
                Fill in your official details below to secure your spot in the 5-day
                Capacity Building Program at MNIT Jaipur.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Form Container Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 transition-all duration-300">
                  <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
                      1
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Student Information
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please use your official MNIT credentials.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <FiUser className="text-cyan-600" />
                        Full Name <span className="text-cyan-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Enter your full name as per records"
                      />
                    </div>

                    {/* Email & Roll Number Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiMail className="text-cyan-600" />
                          MNIT Email <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="you@mnit.ac.in"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiHash className="text-cyan-600" />
                          Roll Number <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="rollNumber"
                          required
                          value={formData.rollNumber}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="e.g. 2024XXXXX"
                        />
                      </div>
                    </div>

                    {/* Department & Phone Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiBookOpen className="text-cyan-600" />
                          Department <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="e.g. Computer Science"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiPhone className="text-cyan-600" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    {/* Year of Study Select */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <FiCalendar className="text-cyan-600" />
                        Year of Study
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Complete Registration</span>
                  <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <p className="text-center text-xs text-slate-500">
                  By registering, you agree to the official terms and conditions of the
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
