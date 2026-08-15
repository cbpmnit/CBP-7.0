"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import Link from "next/link"
import { FiArrowRight } from "react-icons/fi"

const SLIDES = [
  {
    title: "Capacity Building Program",
    subtitle: "CBP 7.0",
    description:
      "A transformative 5-day journey designed to equip first-year students with industry-demanding soft skills, delivered by the Department of Humanities & Social Sciences alongside the Training & Placement Cell.",
  },
  {
    title: "Soft Skills Development",
    subtitle: "Future Ready",
    description:
      "From communication to critical thinking — master the skills that top recruiters look for. Interactive sessions led by industry experts and academicians.",
  },
  {
    title: "Learn. Grow. Lead.",
    subtitle: "Empower Your Potential",
    description:
      "Join a cohort of first-year students at MNIT Jaipur in a structured, engaging program designed to unlock your full potential and accelerate your career journey.",
  },
  {
    title: "Transform Your Future",
    subtitle: "Flagship Initiative",
    description:
      "Register now for CBP 7.0 — the flagship soft skills development program shaping confident, capable, and career-ready engineers at MNIT Jaipur.",
  },
  {
    title: "Your Journey Starts Here",
    subtitle: "Certified Excellence",
    description:
      "Receive an industry-recognized certificate upon completion. Stand out in placements and interviews with proven communication and leadership capabilities.",
  },
]

function HeroComponent() {
  const [current, setCurrent] = useState(0)

  const slides = useMemo(() => SLIDES, [])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const handleSelectSlide = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  const active = slides[current]

  return (
    <section className="hero-section relative min-h-[75vh] w-full overflow-hidden bg-transparent text-slate-900 bg-grid-cyber flex items-center transition-colors duration-300 py-16 sm:py-24">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 w-full">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            {active.title}
            <br />
            <span className="gradient-text-cyan">
              {active.subtitle}
            </span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8">
            {active.description}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Register Now</span>
              <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100/80 px-7 py-4 text-sm font-semibold text-slate-700 transition duration-300 shadow-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-2 bg-white/90 border border-slate-200 backdrop-blur-md px-4 py-2 rounded-full shadow-md">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelectSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-cyan-600 shadow-sm"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-8 z-10 hidden md:block">
        <span className="text-xs font-semibold text-cyan-700 bg-white/90 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm backdrop-blur-md">
          0{current + 1} / 0{slides.length}
        </span>
      </div>
    </section>
  )
}

export const Hero = memo(HeroComponent)
export default Hero
