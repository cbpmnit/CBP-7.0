"use client"

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react"
import Image from "next/image"
import { useAppSelector } from "@/store/hooks"

const SLIDES = [
  {
    image: "/assets/main-assets/home_1.webp",
    badge: "Edition 7.0 • MNIT Jaipur",
    title: "Capacity Building Program",
    subtitle: "CBP 7.0",
    description:
      "A transformative 5-day journey designed to equip first-year students with industry-demanding soft skills, delivered by the Department of Humanities & Social Sciences alongside the Training & Placement Cell.",
  },
  {
    image: "/assets/main-assets/home_2.webp",
    badge: "Build Skills • Master Industry",
    title: "Soft Skills Development",
    subtitle: "Future Ready",
    description:
      "From communication to critical thinking — master the skills that top recruiters look for. Interactive sessions led by industry experts and academicians.",
  },
  {
    image: "/assets/main-assets/home_3.webp",
    badge: "MNIT Jaipur • 500+ Students",
    title: "Learn. Grow. Lead.",
    subtitle: "Empower Your Potential",
    description:
      "Join a cohort of first-year students at MNIT Jaipur in a structured, engaging program designed to unlock your full potential and accelerate your career journey.",
  },
  {
    image: "/assets/main-assets/home_4.webp",
    badge: "5 Days Intensive Program",
    title: "Transform Your Future",
    subtitle: "Flagship Initiative",
    description:
      "Register now for CBP 7.0 — the flagship soft skills development program shaping confident, capable, and career-ready engineers at MNIT Jaipur.",
  },
  {
    image: "/assets/main-assets/home_5.jpg.webp",
    badge: "Get Certified • Placement Advantage",
    title: "Your Journey Starts Here",
    subtitle: "Certified Excellence",
    description:
      "Receive an industry-recognized certificate upon completion. Stand out in placements and interviews with proven communication and leadership capabilities.",
  },
]

function HeroComponent() {
  const theme = useAppSelector((state) => state.theme.theme)
  const [current, setCurrent] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const slides = useMemo(() => SLIDES, [])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (!isLoaded || videoEnded) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, isLoaded, videoEnded])

  const handleEnded = useCallback(() => {
    setVideoEnded(true)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const handleSelectSlide = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  const active = slides[current]

  return (
    <section className="hero-section relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-black bg-grid-cyber gpu-layer transition-colors duration-300">
      {/* Optimized Ambient Radial Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-[80px] pointer-events-none animate-pulse-glow gpu-layer" />
      <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-blue-600/15 blur-[80px] pointer-events-none animate-pulse-glow gpu-layer" />

      {!videoEnded ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-85 gpu-layer transition-opacity duration-300"
          autoPlay
          muted
          playsInline
          preload="metadata"
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
          {slides.map((slide, index) => {
            const imageSrc =
              theme === "light" && index === 0
                ? "/assets/main-assets/home_5.jpg.webp"
                : slide.image
            return (
              <Image
                key={slide.title}
                src={imageSrc}
                alt={slide.title}
                fill
                className={`object-cover transition-opacity duration-700 ${
                  index === current
                    ? theme === "light"
                      ? "opacity-85 scale-102"
                      : "opacity-65 scale-102"
                    : "opacity-0"
                }`}
                priority={index === 0}
                sizes="100vw"
              />
            )
          })}
        </div>
      )}

      {/* Cyber Overlays */}
      <div className="hero-overlay hero-overlay-left absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent transition-all duration-300" />
      <div className="hero-overlay hero-overlay-top absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 transition-all duration-300" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 lg:px-8">
        <div className="max-w-2xl pt-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
            <span className="text-xs font-medium uppercase tracking-wider text-cyan-300">
              {active.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {active.title}
            <br />
            <span className="gradient-text-cyan drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              {active.subtitle}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
            {active.description}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="/registration"
              className="inline-flex items-center justify-center rounded-xl neon-button-cyan px-8 py-4 text-sm font-medium uppercase tracking-wide group"
            >
              Register Now
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
            </a>
            <a
              href="/about"
              className="hero-secondary-btn inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-7 py-4 text-sm font-medium text-gray-200 transition duration-300 hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Slide Pagination */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="hero-pagination-bar flex items-center gap-2.5 bg-black/60 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelectSlide(i)}
              className={`hero-pagination-dot h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-cyan-400 shadow-[0_0_10px_#00f0ff]"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden md:block">
        <span className="hero-counter-badge text-xs font-sans text-cyan-400/80 bg-black/60 border border-cyan-500/20 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all duration-300">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  )
}

const Hero = memo(HeroComponent)
export default Hero
