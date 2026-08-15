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
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        {/* Banner - Center Aligned */}
        <section className="relative bg-gradient-to-b from-white to-slate-100/60 py-24 sm:py-32 overflow-hidden border-b border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="relative mx-auto max-w-3xl px-5 lg:px-8 text-center z-10">
            <Reveal>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                About CBP <span className="gradient-text-cyan">7.0</span>
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-slate-600 sm:text-lg">
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
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  A Centralized Event <span className="gradient-text-cyan">Management System</span>
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
                  <p>
                    The CBP 7.0 website is a comprehensive centralized event
                    management system designed specifically for managing the
                    Capacity Building Program at MNIT Jaipur. Built to serve{" "}
                    <strong className="text-cyan-700 font-semibold">400+ first-year students</strong>,
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
                    <strong className="text-cyan-700 font-semibold">
                      Department of Humanities and Social Sciences
                    </strong>{" "}
                    and the{" "}
                    <strong className="text-cyan-700 font-semibold">
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
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 opacity-30 blur-xl transition duration-500 group-hover:opacity-50" />
                  
                  <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
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
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="bg-white py-24 sm:py-32 border-t border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Built for Efficiency &amp; <span className="gradient-text-cyan">Impact</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
                  Every feature is designed to make program management effortless
                  and student engagement meaningful and measurable.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 80}>
                  <div className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between h-full group text-center sm:text-left">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition duration-300">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
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
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Driving Digital <span className="gradient-text-cyan">Transformation</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
                  The CBP platform pursues clear, measurable objectives to
                  transform how MNIT Jaipur manages its flagship soft skills
                  program for the modern era.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {objectivesList.map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="glass-card glass-card-hover rounded-2xl p-6 text-center sm:text-left">
                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Ready to Join <span className="gradient-text-cyan">CBP 7.0?</span>
              </h2>
              <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
                Register now and start your journey toward becoming
                industry-ready.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-9 py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5"
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
