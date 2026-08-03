"use client"

import { useEffect, useState } from "react"

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const calculateTimeLeft = () => {
      const now = new Date()
      // Target: 31 August 2026, 6:00 PM (18:00:00)
      const targetDate = new Date("August 31, 2026 18:00:00")
      const difference = +targetDate - +now

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
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-mnit-navy py-16 px-5 border-t border-b border-mnit-gold/30 relative overflow-hidden">
      {/* Background glowing blur effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-mnit-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="inline-block rounded-full bg-mnit-gold/10 border border-mnit-gold/30 px-4 py-1.5 text-xs font-semibold text-mnit-gold uppercase tracking-widest">
          Registration Deadline Countdown
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
          CBP 7.0 Registration
        </h2>
        <p className="mt-2 text-sm text-gray-400 font-medium">
          Target Date: 31 August 2026, 6:00 PM
        </p>

        {mounted ? (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto">
            {/* Days Card */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-mnit-gold/40 transition-colors duration-300 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
              <span className="block text-3xl md:text-5xl font-black text-mnit-gold tracking-tight">
                {timeLeft.days}
              </span>
              <span className="block mt-2 text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Days
              </span>
            </div>

            {/* Hours Card */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-mnit-gold/40 transition-colors duration-300 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
              <span className="block text-3xl md:text-5xl font-black text-white tracking-tight">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="block mt-2 text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Hours
              </span>
            </div>

            {/* Minutes Card */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-mnit-gold/40 transition-colors duration-300 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
              <span className="block text-3xl md:text-5xl font-black text-white tracking-tight">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="block mt-2 text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Minutes
              </span>
            </div>

            {/* Seconds Card */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-mnit-gold/40 transition-colors duration-300 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
              <span className="block text-3xl md:text-5xl font-black text-mnit-gold tracking-tight animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="block mt-2 text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                Seconds
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-10 text-lg font-medium text-mnit-gold">
            Loading timer...
          </div>
        )}

        <div className="mt-8">
          <a
            href="/registration"
            className="inline-flex items-center justify-center rounded-xl bg-mnit-gold hover:bg-white text-mnit-navy font-bold px-8 py-3.5 text-sm transition duration-300 shadow-lg hover:shadow-mnit-gold/20"
          >
            Go to Registration
          </a>
        </div>
      </div>
    </section>
  )
}
