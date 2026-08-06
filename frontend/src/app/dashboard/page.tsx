"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { api, ApiError } from "@/utils/api"
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi"

type WorkflowStep = "PROFILE_INCOMPLETE" | "REGISTRATION_PENDING" | "PAYMENT_PENDING" | "CONFIRMED"

interface ProfileCompletion {
  completed: boolean
  completionPercentage: number
  lastCompletedStep: string
}

interface CbpRegistration {
  registrationId: string
  registrationStatus: string
}

interface PaymentInfo {
  paymentStatus: string
  transactionId: string
  amount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { studentId, role, name } = useAppSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null)
  const [cbpRegistration, setCbpRegistration] = useState<CbpRegistration | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("PROFILE_INCOMPLETE")

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Fetch Profile Completion
      const profileComp = await api.get<ProfileCompletion>("/api/v1/profile/completion")
      setProfileCompletion(profileComp)

      if (!profileComp.completed) {
        setCurrentStep("PROFILE_INCOMPLETE")
        setLoading(false)
        return
      }

      // 2. Fetch CBP Registration
      let reg: CbpRegistration | null = null
      try {
        reg = await api.get<CbpRegistration>("/api/v1/cbp/me")
        setCbpRegistration(reg)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Registration does not exist yet
          setCurrentStep("REGISTRATION_PENDING")
          setLoading(false)
          return
        }
        throw err
      }

      // 3. Fetch Payment details
      let pay: PaymentInfo | null = null
      try {
        const payments = await api.get<PaymentInfo[]>("/api/v1/payment/me")
        if (payments && payments.length > 0) {
          pay = payments[0]
          setPaymentInfo(pay)
        }
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) {
          throw err
        }
      }

      // Determine final state based on registration and payment status
      if (reg.registrationStatus === "REGISTERED" || (pay && pay.paymentStatus === "SUCCESS")) {
        setCurrentStep("CONFIRMED")
      } else {
        setCurrentStep("PAYMENT_PENDING")
      }
      
    } catch (err: any) {
      logError(err)
      setError("Failed to fetch dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const logError = (err: any) => {
    console.error("Dashboard fetch error:", err)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Analyzing Portal Status...
          </span>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber py-24 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-5 relative z-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-8 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                  Student Portal Dashboard
                </span>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Welcome, <span className="gradient-text-cyan">{name || "Student"}</span>
                </h1>
                <p className="mt-1 text-sm text-gray-400 font-mono">
                  Roll Number: {studentId} | Role: {role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-6 md:mt-0 inline-flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition duration-200 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </Reveal>

          {/* Error Alert */}
          {error && (
            <Reveal>
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-semibold flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={fetchDashboardData} className="ml-auto underline text-xs font-bold uppercase tracking-wider">Retry</button>
              </div>
            </Reveal>
          )}

          {/* Dynamic Next Action Banner */}
          <Reveal delay={40}>
            <div className="mb-10 p-6 rounded-3xl glass-card border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-1.5">
                  {currentStep === "CONFIRMED" ? (
                    <FiCheckCircle className="text-green-400 shadow-[0_0_10px_#4ade80]" />
                  ) : (
                    <FiAlertCircle className="text-yellow-400 animate-pulse" />
                  )}
                  Next Action Required
                </span>
                <h4 className="text-lg font-bold text-white">
                  {currentStep === "PROFILE_INCOMPLETE" && "Complete your student profile details"}
                  {currentStep === "REGISTRATION_PENDING" && "Complete your CBP 7.0 event registration"}
                  {currentStep === "PAYMENT_PENDING" && "Complete your CBP registration payment"}
                  {currentStep === "CONFIRMED" && "CBP 7.0 Event Registration Confirmed!"}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {currentStep === "PROFILE_INCOMPLETE" && `Your profile is only ${profileCompletion?.completionPercentage || 0}% complete. Please fill in required personal and academic details.`}
                  {currentStep === "REGISTRATION_PENDING" && "You must complete the Capacity Building Program registration form to confirm program slots."}
                  {currentStep === "PAYMENT_PENDING" && `CBP Registration created (ID: ${cbpRegistration?.registrationId}). Please process the required program fee of 500.00 INR.`}
                  {currentStep === "CONFIRMED" && "Payment processed successfully. You are officially registered for the Soft Skills Capacity Building Program workshops."}
                </p>
              </div>

              {currentStep !== "CONFIRMED" && (
                <Link
                  href={
                    currentStep === "PROFILE_INCOMPLETE" ? "/profile" :
                    currentStep === "REGISTRATION_PENDING" ? "/cbp" : "/payment"
                  }
                  className="sm:self-center inline-flex items-center gap-2 rounded-xl bg-cyan-500 text-black px-5 py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  Proceed
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </Reveal>

          {/* Navigation/Progress Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Profile Setup */}
            <Reveal delay={80}>
              <div className={`glass-card rounded-3xl p-6 flex flex-col h-full justify-between transition-all duration-300 ${
                currentStep === "PROFILE_INCOMPLETE" ? "border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] scale-[1.02]" : "border-cyan-500/30"
              }`}>
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] mb-6">
                    👤
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-extrabold text-white">Student Profile</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      profileCompletion?.completed 
                        ? "bg-green-500/10 border-green-500/40 text-green-300"
                        : "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                    }`}>
                      {profileCompletion?.completed ? "Complete" : `${profileCompletion?.completionPercentage || 0}%`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Set up or modify your personal, academic, and contact details. Keep your profile updated for correct certificate naming.
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-cyan-500 text-black py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition cursor-pointer"
                >
                  Manage Profile
                </Link>
              </div>
            </Reveal>

            {/* Card 2: CBP Registration */}
            <Reveal delay={120}>
              <div className={`glass-card rounded-3xl p-6 flex flex-col h-full justify-between transition-all duration-300 ${
                currentStep === "REGISTRATION_PENDING" ? "border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] scale-[1.02]" : "border-cyan-500/30"
              }`}>
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] mb-6">
                    📝
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-extrabold text-white">CBP Program</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      cbpRegistration 
                        ? "bg-green-500/10 border-green-500/40 text-green-300"
                        : currentStep === "PROFILE_INCOMPLETE"
                        ? "bg-gray-500/10 border-gray-500/30 text-gray-500"
                        : "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                    }`}>
                      {cbpRegistration ? "Registered" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Complete your Capacity Building Program event registration to attend standard 5-day soft skills training workshops.
                  </p>
                </div>
                <Link
                  href={currentStep === "PROFILE_INCOMPLETE" ? "/profile" : "/cbp"}
                  className={`inline-flex items-center justify-center w-full rounded-xl py-3 text-xs font-extrabold uppercase tracking-widest transition cursor-pointer ${
                    currentStep === "PROFILE_INCOMPLETE"
                      ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {currentStep === "PROFILE_INCOMPLETE" ? "Lock Profile First" : "CBP Status"}
                </Link>
              </div>
            </Reveal>

            {/* Card 3: Payments */}
            <Reveal delay={160}>
              <div className={`glass-card rounded-3xl p-6 flex flex-col h-full justify-between transition-all duration-300 ${
                currentStep === "PAYMENT_PENDING" ? "border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] scale-[1.02]" : "border-cyan-500/30"
              }`}>
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] mb-6">
                    💳
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-extrabold text-white">Payments</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      currentStep === "CONFIRMED"
                        ? "bg-green-500/10 border-green-500/40 text-green-300"
                        : currentStep === "PROFILE_INCOMPLETE" || currentStep === "REGISTRATION_PENDING"
                        ? "bg-gray-500/10 border-gray-500/30 text-gray-500"
                        : "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                    }`}>
                      {currentStep === "CONFIRMED" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Complete and review registrations transaction logs, generate receipts, and track online/offline fees processing status.
                  </p>
                </div>
                <Link
                  href={
                    currentStep === "PROFILE_INCOMPLETE" ? "/profile" :
                    currentStep === "REGISTRATION_PENDING" ? "/cbp" : "/payment"
                  }
                  className={`inline-flex items-center justify-center w-full rounded-xl py-3 text-xs font-extrabold uppercase tracking-widest transition cursor-pointer ${
                    currentStep === "PROFILE_INCOMPLETE" || currentStep === "REGISTRATION_PENDING"
                      ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {currentStep === "PROFILE_INCOMPLETE" || currentStep === "REGISTRATION_PENDING"
                    ? "Complete Steps First"
                    : "Payments Portal"}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
