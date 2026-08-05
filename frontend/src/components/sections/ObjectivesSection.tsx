import { memo, useMemo } from "react"
import Reveal from "@/components/animations/RevealOnScroll"
import {
  FiLayers,
  FiZap,
  FiUsers,
  FiAward,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiSend,
} from "react-icons/fi"

const OBJECTIVES_DATA = [
  {
    icon: <FiLayers className="h-7 w-7" />,
    title: "Digitize Workflow",
    description:
      "Replace manual, paper-based processes with a fully digital platform for end-to-end program management — from registration to certificate delivery.",
  },
  {
    icon: <FiZap className="h-7 w-7" />,
    title: "Automate Repetitive Tasks",
    description:
      "Automate student registration, attendance tracking, fee collection, and certificate generation, saving hundreds of person-hours of administrative work.",
  },
  {
    icon: <FiUsers className="h-7 w-7" />,
    title: "Enhance Engagement",
    description:
      "Keep 400+ students connected and informed with real-time announcements, session reminders, and interactive digital features throughout the program.",
  },
  {
    icon: <FiAward className="h-7 w-7" />,
    title: "Professional Presence",
    description:
      "Deliver a polished, institution-grade digital experience that reflects MNIT Jaipur's commitment to academic and professional excellence.",
  },
  {
    icon: <FiFileText className="h-7 w-7" />,
    title: "Reduce Paperwork",
    description:
      "Transition to a fully paperless workflow with digital registration forms, QR-based attendance, and downloadable e-certificates — saving costs and the environment.",
  },
  {
    icon: <FiTrendingUp className="h-7 w-7" />,
    title: "Enable Data Analytics",
    description:
      "Gain powerful, actionable insights from attendance rates, session engagement metrics, and program performance dashboards in real time.",
  },
  {
    icon: <FiCheckCircle className="h-7 w-7" />,
    title: "Automate Certificates",
    description:
      "Instantly generate and distribute personalized, QR-code-verified completion certificates to every participant who meets the attendance criteria.",
  },
  {
    icon: <FiSend className="h-7 w-7" />,
    title: "Streamline Communication",
    description:
      "Send targeted announcements, reminders, and updates directly to students, coordinators, and administrators through a unified communication hub.",
  },
]

function ObjectivesSectionComponent() {
  const objectives = useMemo(() => OBJECTIVES_DATA, [])

  return (
    <section className="bg-black py-24 sm:py-32 relative overflow-hidden bg-grid-cyber">
      {/* Background Radial Light */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal variant="scale">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              Key Objectives
            </span>
          </Reveal>
          <Reveal variant="up" delay={80}>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              What We Aim to <span className="gradient-text-cyan">Achieve</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={140}>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              The CBP 7.0 platform is built with a clear mission — to transform
              how MNIT Jaipur manages its flagship soft skills program, making it
              more efficient, engaging, and impactful for everyone involved.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {objectives.map((item, idx) => (
            <Reveal
              key={item.title}
              variant={idx % 2 === 0 ? "left" : "right"}
              delay={(idx % 4) * 100}
            >
              <div className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between group h-full">
                <div>
                  <div className="card-icon-badge flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-white group-hover:text-cyan-300 transition duration-300">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const ObjectivesSection = memo(ObjectivesSectionComponent)
export default ObjectivesSection
