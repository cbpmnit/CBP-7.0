import Link from "next/link"
import { memo } from "react"
import { HiOutlineAcademicCap } from "react-icons/hi2"

function CTASectionComponent() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32 border-t border-slate-200 bg-grid-cyber">
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center glass-card rounded-3xl p-10 sm:p-16 border-slate-200 bg-white shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-sm transition-all duration-300 hover:scale-105">
            <HiOutlineAcademicCap className="h-9 w-9" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Ready to Build Your <span className="gradient-text-cyan">Future?</span>
          </h2>
          
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            Join CBP 7.0 and take the first step toward becoming a confident,
            skilled, and industry-ready professional. Registration is now open
            for all first-year students at MNIT Jaipur.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/registration"
              className="inline-flex items-center justify-center rounded-xl neon-button-cyan px-9 py-4 text-sm font-extrabold uppercase tracking-wider group"
            >
              Register for CBP 7.0
              <svg
                className="ml-2.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 text-sm font-bold text-gray-200 transition duration-300 hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

const CTASection = memo(CTASectionComponent)
export default CTASection
