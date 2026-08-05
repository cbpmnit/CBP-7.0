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
    <section className="bg-black py-20 px-5 border-t border-b border-cyan-500/20 relative overflow-hidden bg-grid-cyber">
      {/* Background glowing blur effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Reveal variant="scale">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
            Registration Deadline Countdown
          </span>
        </Reveal>
        
        <Reveal variant="up" delay={80}>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl tracking-tight">
            CBP 7.0 <span className="gradient-text-cyan">Registration</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-sans">
            Target Date: 31 August 2026, 6:00 PM
          </p>
        </Reveal>

        <Reveal variant="scale" delay={160}>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
            {/* Days Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-cyan-400 tracking-tight drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                suppressHydrationWarning
              >
                {displayTime.days}
              </span>
              <span className="block mt-3 text-xs font-medium uppercase tracking-widest text-gray-400 group-hover:text-cyan-300">
                Days
              </span>
            </div>

            {/* Hours Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-white tracking-tight"
                suppressHydrationWarning
              >
                {String(displayTime.hours).padStart(2, "0")}
              </span>
              <span className="block mt-3 text-xs font-medium uppercase tracking-widest text-gray-400 group-hover:text-cyan-300">
                Hours
              </span>
            </div>

            {/* Minutes Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-white tracking-tight"
                suppressHydrationWarning
              >
                {String(displayTime.minutes).padStart(2, "0")}
              </span>
              <span className="block mt-3 text-xs font-medium uppercase tracking-widest text-gray-400 group-hover:text-cyan-300">
                Minutes
              </span>
            </div>

            {/* Seconds Card */}
            <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-8 text-center relative group">
              <span
                className="block text-4xl md:text-6xl font-extrabold text-cyan-400 tracking-tight animate-pulse drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                suppressHydrationWarning
              >
                {String(displayTime.seconds).padStart(2, "0")}
              </span>
              <span className="block mt-3 text-xs font-medium uppercase tracking-widest text-gray-400 group-hover:text-cyan-300">
                Seconds
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={240}>
          <div className="mt-10">
            <a
              href="/registration"
              className="inline-flex items-center justify-center rounded-xl neon-button-cyan px-8 py-4 text-sm font-medium uppercase tracking-wider"
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
