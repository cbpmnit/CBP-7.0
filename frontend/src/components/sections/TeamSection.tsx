"use client"

import Image from "next/image"
import { useState } from "react"
import Reveal from "@/components/animations/RevealOnScroll"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

const team = [
  // Advisors
  {
    name: "Prof. Nupur Tandon",
    role: "Advisor",
    department: "Head, Dept. of HSS, MNIT Jaipur",
    image: "/assets/advisors/professor nupur tondon, head department of hss, mnit jaipur.jpeg",
  },
  {
    name: "Prof. Rakesh Jain",
    role: "Advisor",
    department: "In-charge, T&P Cell, MNIT Jaipur",
    image: "/assets/advisors/professor rakesh jain, in-charge, t&p cell , mnit jaipur.jpeg",
  },
  // Convenor
  {
    name: "Dr. Niraja Saraswat",
    role: "Convenor",
    department: "Assistant Professor, Dept. of HSS, MNIT Jaipur",
    image: "/assets/advisors/doctor niraja saraswat, assistant professor, department of humanities and social sciences , mnit jaipur.jpeg",
  },
  // Coordinators
  {
    name: "Dr. Nidhi Sharma",
    role: "Coordinator",
    department: "Assistant Professor, Dept. of HSS, MNIT Jaipur",
    image: "/assets/advisors/dr. nidhi sharma , assistant professor, department of hss , mnit jaipur.jpeg",
  },
  {
    name: "Dr. Priyanka Harjule",
    role: "Coordinator",
    department: "Assistant Professor, Dept. of Mathematics, MNIT Jaipur",
    image: "/assets/advisors/dr. meena nemiwal , assistant professor , department of chemistry mnit jaipur.jpeg",
  },
  {
    name: "Dr. Meena Nemiwal",
    role: "Coordinator",
    department: "Assistant Professor, Dept. of Chemistry, MNIT Jaipur",
    image: "/assets/advisors/dr. priyanka harjule , assistant professor , department of mathematics, mnit jaipur.jpeg",
  },
]

export default function TeamSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % team.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + team.length) % team.length)
  }

  return (
    <section className="bg-slate-50 py-24 sm:py-32 relative overflow-hidden bg-grid-cyber border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal variant="up">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Meet the <span className="gradient-text-cyan">Advisors</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              The CBP 7.0 is spearheaded by dedicated faculty members and the
              Training &amp; Placement Cell at MNIT Jaipur, ensuring a world-class
              learning experience for every participant.
            </p>
          </Reveal>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex mt-16 flex-wrap justify-center gap-10 lg:gap-16">
          {team.map((member, idx) => (
            <Reveal
              key={member.name}
              variant="scale"
              delay={idx * 120}
            >
              <div className="glass-card glass-card-hover rounded-3xl p-8 flex flex-col items-center text-center w-72 group h-full">
                <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-cyan-600/40 shadow-sm transition duration-500 group-hover:scale-105 group-hover:border-cyan-600">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition duration-300">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  {member.role}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 font-sans">
                  {member.department}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile Carousel With Sliding Animation */}
        <div className="block md:hidden mt-10 relative px-4">
          <div className="min-h-[380px] flex items-center justify-center">
            <div className="w-full flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="glass-card rounded-3xl p-8 flex flex-col items-center text-center w-72"
                >
                  <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-cyan-600/40 shadow-sm">
                    <Image
                      src={team[currentIndex].image}
                      alt={team[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {team[currentIndex].name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-cyan-700">
                    {team[currentIndex].role}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 font-sans">
                    {team[currentIndex].department}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700 text-lg shadow-sm"
              aria-label="Previous Team Member"
            >
              <FiChevronLeft />
            </button>

            <div className="flex gap-2">
              {team.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-6 bg-cyan-600"
                      : "w-2 bg-slate-300"
                  }`}
                  aria-label={`Go to team member ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700 text-lg shadow-sm"
              aria-label="Next Team Member"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
