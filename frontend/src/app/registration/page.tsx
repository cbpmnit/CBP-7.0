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
        <main className="min-h-screen bg-white">
          <section className="flex min-h-[60vh] items-center justify-center py-20">
            <div className="mx-auto max-w-lg px-5 text-center">
              <Reveal>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-6 text-2xl font-bold text-mnit-navy">
                  Registration Successful!
                </h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Welcome, <strong className="text-mnit-navy">{formData.name}</strong>!
                  Your registration for CBP 7.0 has been received. A confirmation
                  email will be sent to{" "}
                  <strong className="text-mnit-navy">{formData.email}</strong> with
                  the program schedule, payment details, and further instructions.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 rounded-xl border border-gray-100 bg-mnit-light p-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Registration Summary
                  </p>
                  <dl className="space-y-2.5 text-sm">
                    {[
                      ["Name", formData.name],
                      ["Email", formData.email],
                      ["Roll Number", formData.rollNumber],
                      ["Department", formData.department],
                      ["Year", formData.year],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="font-medium text-mnit-navy text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  href="/"
                  className="mt-8 inline-flex items-center justify-center rounded-xl bg-mnit-blue px-7 py-3 text-sm font-bold text-white transition duration-200 hover:bg-mnit-navy"
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
      <main className="min-h-screen bg-white">
        <section className="bg-mnit-navy py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
                Registration
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Register for <span className="text-mnit-gold">CBP 7.0</span>
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
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mnit-blue text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-mnit-navy">
                        Personal Information
                      </h2>
                      <p className="text-xs text-gray-500">
                        Please use your official MNIT credentials.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition duration-200 focus:border-mnit-blue focus:outline-none focus:ring-1 focus:ring-mnit-blue"
                        placeholder="Enter your full name as per records"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          MNIT Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1.5 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition duration-200 focus:border-mnit-blue focus:outline-none focus:ring-1 focus:ring-mnit-blue"
                          placeholder="you@mnit.ac.in"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Roll Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="rollNumber"
                          required
                          value={formData.rollNumber}
                          onChange={handleChange}
                          className="mt-1.5 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition duration-200 focus:border-mnit-blue focus:outline-none focus:ring-1 focus:ring-mnit-blue"
                          placeholder="e.g. 2024XXXXX"
                        />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="mt-1.5 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition duration-200 focus:border-mnit-blue focus:outline-none focus:ring-1 focus:ring-mnit-blue"
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1.5 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition duration-200 focus:border-mnit-blue focus:outline-none focus:ring-1 focus:ring-mnit-blue"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Year of Study
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition duration-200 focus:border-mnit-blue focus:outline-none focus:ring-1 focus:ring-mnit-blue"
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
                  className="w-full rounded-xl bg-mnit-blue py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-mnit-navy hover:shadow-lg"
                >
                  Complete Registration
                </button>

                <p className="text-center text-xs text-gray-400">
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
