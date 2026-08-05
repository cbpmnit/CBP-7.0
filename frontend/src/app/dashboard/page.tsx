"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { studentId, role, name } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
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
                className="mt-6 md:mt-0 inline-flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition duration-200"
              >
                Log Out
              </button>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Profile Setup */}
            <Reveal delay={80}>
              <div className="glass-card rounded-3xl p-6 border-cyan-500/30 flex flex-col h-full justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] mb-6">
                    👤
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">Student Profile</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Set up or modify your personal, academic, and contact details. Keep your profile updated for correct certificate naming.
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-cyan-500 text-black py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition"
                >
                  Manage Profile
                </Link>
              </div>
            </Reveal>

            {/* Card 2: CBP Registration */}
            <Reveal delay={120}>
              <div className="glass-card rounded-3xl p-6 border-cyan-500/30 flex flex-col h-full justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] mb-6">
                    📝
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">CBP Program</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Complete your Capacity Building Program event registration to attend standard 5-day soft skills training workshops.
                  </p>
                </div>
                <Link
                  href="/cbp"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-cyan-500 text-black py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition"
                >
                  CBP Status
                </Link>
              </div>
            </Reveal>

            {/* Card 3: Payments */}
            <Reveal delay={160}>
              <div className="glass-card rounded-3xl p-6 border-cyan-500/30 flex flex-col h-full justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] mb-6">
                    💳
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">Payments</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Complete and review registrations transaction logs, generate receipts, and track online/offline fees processing status.
                  </p>
                </div>
                <Link
                  href="/payment"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-cyan-500 text-black py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition"
                >
                  Payments Portal
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
