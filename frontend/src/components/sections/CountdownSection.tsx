"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import Reveal from "@/components/animations/RevealOnScroll"

const TARGET_DATE = new Date(2026, 7, 31, 18, 0, 0) // 31 August 2026, 6:00 PM

function calculateInitialTime() {
  const now = new Date()
  const difference = +TARGET_DATE - +now
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }
  return { days: 0, hours: 0, minutes: 0, seconds: 0 }
}

function CountdownSectionComponent() {
  const [timeLeft, setTimeLeft] = useState(calculateInitialTime)
  const [mounted, setMounted] = useState(false)

  const calculateTimeLeft = useCallback(() => {
    const now = new Date()
    const difference = +TARGET_DATE - +now

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  const displayTime = useMemo(() => {
    return mounted ? timeLeft : calculateInitialTime()
  }, [mounted, timeLeft])

  return (
    <section className="bg-slate-50 py-20 px-5 border-t border-b border-slate-200 relative overflow-hidden bg-grid-cyber">
      {/* Background glowing blur effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Reveal variant="up">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            CBP 7.0 <span className="gradient-text-cyan">Registration Countdown</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-sans">
            Target Date: 31 August 2026, 6:00 PM
          </p>
        </Reveal>

        <Reveal variant="scale" delay={120}>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
            {/* Days Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-cyan-700 tracking-tight"
                suppressHydrationWarning
              >
                {displayTime.days}
              </span>
              <span className="block mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-cyan-700">
                Days
              </span>
            </div>

            {/* Hours Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
                suppressHydrationWarning
              >
                {String(displayTime.hours).padStart(2, "0")}
              </span>
              <span className="block mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-cyan-700">
                Hours
              </span>
            </div>

            {/* Minutes Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
                suppressHydrationWarning
              >
                {String(displayTime.minutes).padStart(2, "0")}
              </span>
              <span className="block mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-cyan-700">
                Minutes
              </span>
            </div>

            {/* Seconds Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-cyan-700 tracking-tight animate-pulse"
                suppressHydrationWarning
              >
                {String(displayTime.seconds).padStart(2, "0")}
              </span>
              <span className="block mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-cyan-700">
                Seconds
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={200}>
          <div className="mt-10">
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5"
            >
              Go to Registration
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const CountdownSection = memo(CountdownSectionComponent)
export default CountdownSection
