"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const testimonials = [
  {
    name: "Diksha Gupta",
    rollNumber: "2021UME1409",
    quote:
      "I enrolled in the CBP program on the recommendation of my seniors, and it turned out to be a life-changing decision. The program taught me many practical applications from the Bhagavad Gita that helped me deal with stress, anxiety, and peer pressure while staying focused on my goals. It kept me away from the usual distractions of college life. Surrounded by such positive and inspiring people, I was able to maintain a good CGPA and secure two internships and two placement offers during my B.Tech.",
    image: "/assets/seniors/DeekshaSinghal.webp",
  },
  {
    name: "Saurav Raj",
    rollNumber: "2022UEE1169",
    quote:
      "When I came to college, I was a very shy person and wasn't good at socializing. The first thing that CBP helped me with was building a feeling of community and socializing with new students that joined the program, which eventually helped me in developing a better personality. Secondly, I got a chance to hear from very senior and qualified leaders and their guidance helped me in my career too.",
    image: "/assets/seniors/Akash Kumar.webp",
  },
  {
    name: "Amit Tiwari",
    rollNumber: "2022UME1200",
    quote:
      "Capacity Building Program affected my life very greatly. In this Program I learnt how should be our lifestyle. I learnt how to control the mind. There are many other things like why Bhagavad Gita is important for our life and how we can make our life blissful and disciplined by reading Bhagavad Gita. This Program teaches the value of life, goals and character.",
    image: "/assets/seniors/ansh.webp",
  },
  {
    name: "Kuldeep Dadrwal",
    rollNumber: "2020UEC1645",
    quote:
      "The Capacity Building Program affected my life very greatly. Through this program I learned how valuable the Bhagavad Gita is as a guide for living a disciplined and meaningful life. I gained practical wisdom on managing the mind, staying focused on goals, and building character — tools that have shaped both my academic and personal growth in ways I never imagined possible.",
    image: "/assets/seniors/TusharChoudhary.webp",
  },
]

export default function FeedbackSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext()
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-black py-24 sm:py-32 relative overflow-hidden bg-grid-cyber border-t border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              Student Feedback
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              What Our Alumni <span className="gradient-text-cyan">Say</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              Real stories from students whose lives were transformed by the
              Capacity Building Program.
            </p>
          </Reveal>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid mt-16 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100} variant={i % 2 === 0 ? "left" : "right"}>
              <div className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-white group-hover:text-cyan-300 transition duration-300 truncate">
                        {t.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans truncate">
                        {t.rollNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <svg
                      className="h-6 w-6 text-cyan-400/60"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983z" />
                    </svg>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">
                      {t.quote}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="block md:hidden mt-10 relative px-4">
          <div className="overflow-hidden min-h-[360px] flex items-center justify-center">
            {testimonials.map((t, idx) => (
              <div
                key={t.name}
                className={`w-full transition-all duration-500 ease-in-out transform ${
                  idx === currentIndex
                    ? "opacity-100 translate-x-0 relative"
                    : "opacity-0 absolute translate-x-12 pointer-events-none"
                }`}
              >
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-cyan-500/40">
                        <Image
                          src={t.image}
                          alt={t.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {t.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-sans truncate">
                          {t.rollNumber}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-gray-300">
                      {t.quote}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 text-cyan-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-black/60 text-cyan-400 text-lg"
              aria-label="Previous Testimonial"
            >
              <FiChevronLeft />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-black/60 text-cyan-400 text-lg"
              aria-label="Next Testimonial"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
