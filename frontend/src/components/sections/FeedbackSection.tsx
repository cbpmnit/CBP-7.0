"use client"

import Image from "next/image"
import { useState } from "react"
import Reveal from "@/components/animations/RevealOnScroll"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion" // Added this import

const testimonials = [
  {
    name: "Diksha Gupta",
    rollNumber: "2021UME1409",
    quote:
      "I enrolled in the CBP program on the recommendation of my seniors, and it turned out to be a life-changing decision. The program taught me many practical applications from the Bhagavad Gita that helped me deal with stress, anxiety, and peer pressure while staying focused on my goals. It kept me away from the usual distractions of college life. Surrounded by such positive and inspiring people, I was able to maintain a good CGPA and secure two internships and two placement offers during my B.Tech.",
  },
  {
    name: "Saurav Raj",
    rollNumber: "2022UEE1169",
    quote:
      "When I came to college, I was a very shy person and wasn't good at socializing. The first thing that CBP helped me with was building a feeling of community and socializing with new students that joined the program, which eventually helped me in developing a better personality. Secondly, I got a chance to hear from very senior and qualified leaders and their guidance helped me in my career too.",
  },
  {
    name: "Amit Tiwari",
    rollNumber: "2022UME1200",
    quote:
      "Capacity Building Program affected my life very greatly. In this Program I learnt how should be our lifestyle. I learnt how to control the mind. There are many other things like why Bhagavad Gita is important for our life and how we can make our life blissful and disciplined by reading Bhagavad Gita. This Program teaches the value of life, goals and character.",
  },
  {
    name: "Kuldeep Dadrwal",
    rollNumber: "2020UEC1645",
    quote:
      "The Capacity Building Program affected my life very greatly. Through this program I learned how valuable the Bhagavad Gita is as a guide for living a disciplined and meaningful life. I gained practical wisdom on managing the mind, staying focused on goals, and building character, tools that have shaped both my academic and personal growth in ways I never imagined possible.",
  },
]

export default function FeedbackSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  return (
    <section>
      <div className="max-w-7xl mx-auto px-4">
        <Reveal variant="up">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            What Our <span className="gradient-text-cyan">Alumni</span> Say
          </h2>
        </Reveal>

        <Reveal variant="up" delay={80}>
          <p className="mt-4 max-w-2xl mx-auto text-center text-base leading-relaxed text-slate-600">
            Real stories from students whose lives were transformed by the
            Capacity Building Program.
          </p>
        </Reveal>

        {/* Desktop Layout */}
        <div className="hidden md:grid mt-16 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 100}
              variant={i % 2 === 0 ? "left" : "right"}
            >
              <div className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-center gap-4">

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition duration-300 truncate">
                        {t.name}
                      </h3>

                      <p className="text-xs text-slate-500 font-sans truncate">
                        {t.rollNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <svg
                      className="h-6 w-6 text-cyan-600/60"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983z" />
                    </svg>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {t.quote}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-4 w-4 text-cyan-600"
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

        {/* Mobile Carousel With Sliding Animation */}
        <div className="block md:hidden mt-10 relative px-4">
          <div className="min-h-[360px] flex items-center justify-center">
            <div className="w-full">
              {/* Added AnimatePresence to handle component mounting/unmounting */}
              <AnimatePresence mode="wait">
                <motion.div
                  // The key prop tells Framer Motion to animate when currentIndex changes
                  key={currentIndex} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4">

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {testimonials[currentIndex].name}
                        </h3>

                        <p className="text-xs text-slate-500 font-sans truncate">
                          {testimonials[currentIndex].rollNumber}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {testimonials[currentIndex].quote}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 text-cyan-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700 text-lg shadow-sm"
              aria-label="Previous Testimonial"
            >
              <FiChevronLeft />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-6 bg-cyan-600"
                      : "w-2 bg-slate-300"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700 text-lg shadow-sm"
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
