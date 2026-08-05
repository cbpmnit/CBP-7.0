import Image from "next/image"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export const metadata = {
  title: "About CBP 7.0",
  description:
    "Learn about the Capacity Building Program 7.0 at MNIT Jaipur — a centralized event management system for 400+ first-year students.",
}

const platformFeatures = [
  {
    title: "Student Registration",
    desc: "Online self-registration with secure authentication, profile setup, and instant program enrollment for all 400+ first-year students.",
  },
  {
    title: "Secure Fee Payments",
    desc: "Integrated payment gateway supporting multiple methods with instant digital receipt generation and complete payment history tracking.",
  },
  {
    title: "Attendance Tracking",
    desc: "Real-time attendance monitoring across all sessions with QR code and manual verification options. Auto-absent marking for seamless management.",
  },
  {
    title: "Communication Hub",
    desc: "Centralized announcements, session reminders, and targeted notifications delivered directly to all participants without any missed updates.",
  },
  {
    title: "Certificate Generation",
    desc: "Automated personalized certificates with unique QR codes for instant verification. Download immediately upon meeting all completion criteria.",
  },
  {
    title: "Admin Dashboard",
    desc: "Comprehensive admin panel with role-based access, full student management, session scheduling, and complete program analytics at your fingertips.",
  },
]

const objectivesList = [
  { title: "Digitize Workflow", desc: "Replace manual, paper-based processes with a fully digital platform for seamless program management." },
  { title: "Automate Tasks", desc: "Eliminate repetitive admin work through automated registration, attendance, fee collection, and certificate generation." },
  { title: "Enhance Engagement", desc: "Keep all 400+ students connected with real-time announcements and interactive platform features." },
  { title: "Professional Presence", desc: "Deliver an institution-grade, polished digital experience that reflects MNIT Jaipur's commitment to excellence." },
  { title: "Reduce Paperwork", desc: "Go fully paperless with digital forms, e-tickets, QR-based attendance, and downloadable e-certificates." },
  { title: "Enable Analytics", desc: "Gain powerful, actionable insights from attendance rates, engagement metrics, and performance data." },
  { title: "Auto Certificates", desc: "Instantly generate and distribute personalized, QR-verified certificates to every eligible participant." },
  { title: "Streamline Communication", desc: "Send targeted announcements and reminders to all students and coordinators through a unified hub." },
]

export default function AboutPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber">
        {/* Banner */}
        <section className="relative bg-black py-24 sm:py-32 overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-5 lg:px-8 z-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                About the Program
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                About CBP <span className="gradient-text-cyan">7.0</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                A centralized platform built to manage the entire Capacity
                Building Program lifecycle — from registration to certification.
                Serving 400+ first-year students with a seamless digital
                experience.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Overview & High-Tech Video Showcase */}
        <section className="py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <Reveal variant="left">
                <span className="inline-block rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-xs font-medium text-cyan-300 uppercase tracking-wider">
                  Overview &amp; Highlights
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  A Centralized Event <span className="gradient-text-cyan">Management System</span>
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-300">
                  <p>
                    The CBP 7.0 website is a comprehensive centralized event
                    management system designed specifically for managing the
                    Capacity Building Program at MNIT Jaipur. Built to serve{" "}
                    <strong className="text-cyan-300 font-medium">400+ first-year students</strong>,
                    the platform streamlines every aspect of program
                    administration and student participation.
                  </p>
                  <p>
                    From the moment a student registers online to receiving their
                    digital completion certificate, the CBP platform handles it
                    all — eliminating paperwork, reducing administrative
                    overhead, and creating a seamless digital experience for
                    organizers and participants alike.
                  </p>
                  <p>
                    Developed in partnership between the{" "}
                    <strong className="text-cyan-300 font-medium">
                      Department of Humanities and Social Sciences
                    </strong>{" "}
                    and the{" "}
                    <strong className="text-cyan-300 font-medium">
                      Training &amp; Placement Cell
                    </strong>{" "}
                    at MNIT Jaipur.
                  </p>
                </div>
              </Reveal>

              {/* High-Tech Video Showcase Frame */}
              <Reveal variant="right" delay={100}>
                <div className="relative group">
                  {/* Glowing backdrop frame */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-40 blur-xl transition duration-500 group-hover:opacity-70" />
                  
                  <div className="relative aspect-video overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-black shadow-[0_0_40px_rgba(0,240,255,0.3)]">
                    <video
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster="/assets/main-assets/home_1.webp"
                    >
                      <source src="/assets/main-assets/hero.webm" type="video/webm" />
                    </video>

                    {/* Cyber Video Overlay Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/75 border border-cyan-500/40 px-3.5 py-1.5 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                      <span className="text-[10px] font-mono text-cyan-300 font-medium uppercase tracking-wider">
                        CBP 7.0 PROMO VIDEO
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="bg-black/90 py-24 sm:py-32 border-t border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                  Platform Features
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Built for Efficiency &amp; <span className="gradient-text-cyan">Impact</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 text-base leading-relaxed text-gray-400">
                  Every feature is designed to make program management effortless
                  and student engagement meaningful and measurable.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 80}>
                  <div className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between h-full group">
                    <div>
                      <h3 className="text-lg font-medium text-white group-hover:text-cyan-300 transition duration-300">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Key Objectives */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                  Key Objectives
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Driving Digital <span className="gradient-text-cyan">Transformation</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 text-base leading-relaxed text-gray-400">
                  The CBP platform pursues clear, measurable objectives to
                  transform how MNIT Jaipur manages its flagship soft skills
                  program for the modern era.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {objectivesList.map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="glass-card glass-card-hover rounded-2xl p-6">
                    <h3 className="text-base font-medium text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black py-20 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Ready to Join <span className="gradient-text-cyan">CBP 7.0?</span>
              </h2>
              <p className="mt-4 text-base text-gray-300 max-w-xl mx-auto">
                Register now and start your journey toward becoming
                industry-ready.
              </p>
              <Link
                href="/registration"
                className="mt-8 inline-flex items-center justify-center rounded-xl neon-button-cyan px-9 py-4 text-sm font-medium uppercase tracking-wider"
              >
                Register Now
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
