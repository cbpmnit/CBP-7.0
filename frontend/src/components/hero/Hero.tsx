"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"

const slides = [
  {
    image: "/assets/main-assets/home_1.webp",
    badge: "Edition 7.0",
    title: "Capacity Building Program",
    subtitle: "CBP",
    description:
      "A transformative 5-day journey designed to equip first-year students with industry-demanding soft skills, delivered by the Department of Humanities & Social Sciences alongside the Training & Placement Cell.",
  },
  {
    image: "/assets/main-assets/home_2.webp",
    badge: "Build Skills",
    title: "Soft Skills Development",
    subtitle: "Industry Ready",
    description:
      "From communication to critical thinking — master the skills that top recruiters look for. Interactive sessions led by industry experts and academicians.",
  },
  {
    image: "/assets/main-assets/home_3.webp",
    badge: "MNIT Jaipur",
    title: "Learn. Grow. Lead.",
    subtitle: "500+ Students",
    description:
      "Join a cohort of first-year students at MNIT Jaipur in a structured, engaging program designed to unlock your full potential and accelerate your career journey.",
  },
  {
    image: "/assets/main-assets/home_4.webp",
    badge: "5 Days",
    title: "Transform Your Future",
    subtitle: "CBP 7.0",
    description:
      "Register now for CBP 7.0 — the flagship soft skills development program shaping confident, capable, and career-ready engineers at MNIT Jaipur.",
  },
  {
    image: "/assets/main-assets/home_5.jpg.webp",
    badge: "Get Certified",
    title: "Your Journey Starts Here",
    subtitle: "Certified Program",
    description:
      "Receive an industry-recognized certificate upon completion. Stand out in placements and interviews with proven communication and leadership capabilities.",
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  useEffect(() => {
    if (!isLoaded || videoEnded) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, isLoaded, videoEnded])

  const handleEnded = useCallback(() => {
    setVideoEnded(true)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const active = slides[current]

  return (
    <section className="relative h-screen w-full overflow-hidden bg-mnit-navy">
      {!videoEnded ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(e) => e.preventDefault()}
          onLoadedData={() => setIsLoaded(true)}
          onEnded={handleEnded}
        >
          <source src="/assets/main-assets/hero.webm" type="video/webm" />
        </video>
      ) : (
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <Image
              key={slide.title}
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
              priority={index === 0}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-mnit-navy/90 via-mnit-navy/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-mnit-navy/50 via-transparent to-mnit-navy/20" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 lg:px-8">
        <div className="max-w-2xl pt-16">
          <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
            {active.badge}
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {active.title}
            <br />
            <span className="text-mnit-gold">{active.subtitle}</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
            {active.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/registration"
              className="inline-flex items-center justify-center rounded-lg bg-mnit-gold px-7 py-3.5 text-sm font-bold text-mnit-navy transition hover:bg-white hover:shadow-lg"
            >
              Register Now
              <svg
                className="ml-2 h-4 w-4"
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
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-mnit-gold"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 right-5 z-10 hidden md:block">
        <span className="text-xs text-gray-400">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  )
}
