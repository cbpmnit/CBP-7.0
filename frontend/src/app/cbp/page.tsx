"use client"

import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export default function CbpPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber flex items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-xl px-5 relative z-10 text-center">
          <Reveal>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400 text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3)] mb-8">
              📝
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Capacity Building <span className="gradient-text-cyan">Program</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 text-sm leading-relaxed text-gray-300">
              The CBP Event Registration module is currently in development. Once active, students will be able to register for the soft skills program workshops, check schedule updates, and monitor attendance details.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 text-black px-6 py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
