import Hero from "@/components/hero/Hero"
import CountdownSection from "@/components/sections/CountdownSection"
import FeedbackSection from "@/components/sections/FeedbackSection"
import ObjectivesSection from "@/components/sections/ObjectivesSection"
import StatsSection from "@/components/sections/StatsSection"
import CTASection from "@/components/sections/CTASection"
import TeamSection from "@/components/sections/TeamSection"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiMessageSquare,
  FiCpu,
  FiUsers,
  FiBriefcase,
  FiHeart,
} from "react-icons/fi"
import { HiOutlineAcademicCap } from "react-icons/hi2"

const programHighlights = [
  {
    title: "Communication Mastery",
    description:
      "Develop articulate verbal and written communication skills — the cornerstone of every successful career. Learn to convey ideas with clarity, confidence, and impact.",
    icon: <FiMessageSquare className="h-7 w-7" />,
  },
  {
    title: "Critical Thinking",
    description:
      "Build structured problem-solving frameworks and analytical thinking techniques used by top industry leaders to tackle complex challenges.",
    icon: <FiCpu className="h-7 w-7" />,
  },
  {
    title: "Leadership & Teamwork",
    description:
      "Cultivate collaborative intelligence and leadership presence through immersive group activities, role-plays, and real-world simulations.",
    icon: <FiUsers className="h-7 w-7" />,
  },
  {
    title: "Professional Etiquette",
    description:
      "Master the nuances of corporate communication, professional email writing, interview techniques, and workplace decorum expected by Fortune 500 companies.",
    icon: <FiBriefcase className="h-7 w-7" />,
  },
  {
    title: "Emotional Intelligence",
    description:
      "Develop self-awareness, empathy, and resilience — the core emotional competencies that distinguish high-performing individuals in every domain.",
    icon: <FiHeart className="h-7 w-7" />,
  },
  {
    title: "Career Readiness",
    description:
      "Prepare for placements and internships with resume-building workshops, mock interview sessions, personal branding strategies, and LinkedIn profile optimization.",
    icon: <HiOutlineAcademicCap className="h-7 w-7" />,
  },
]

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 selection:bg-cyan-400 selection:text-black">
        <Hero />
        <CountdownSection />

        <StatsSection />

        <section className="py-24 sm:py-32 relative overflow-hidden bg-grid-cyber">
          {/* Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                About the Program
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                CBP 7.0 — <span className="gradient-text-cyan">Capacity Building Program</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-400">
                MNIT CBPT 7.0 is a comprehensive 5-day Soft Skills Development
                Program organized by the{" "}
                <strong className="text-cyan-300 font-semibold">
                  Department of Humanities and Social Sciences
                </strong>{" "}
                in collaboration with the{" "}
                <strong className="text-cyan-300 font-semibold">
                  Training &amp; Placement Cell, MNIT Jaipur
                </strong>
                . The program bridges the gap between academic learning and
                industry expectations, empowering first-year students with the
                skills that matter most in today&apos;s competitive professional
                landscape.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programHighlights.map((item, i) => (
                <Reveal
                  key={item.title}
                  delay={i * 80}
                >
                  <div className="glass-card glass-card-hover rounded-2xl p-8 flex flex-col justify-between h-full group">
                    <div>
                      <div className="card-icon-badge flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300">
                        {item.icon}
                      </div>
                      <h3 className="mt-6 text-lg font-bold text-white group-hover:text-cyan-300 transition duration-300">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <FeedbackSection />
        <ObjectivesSection />
        <TeamSection />
        <CTASection />
      </main>
    </PageTransition>
  )
}
