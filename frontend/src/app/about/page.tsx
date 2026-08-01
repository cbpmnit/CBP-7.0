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
      <main className="min-h-screen bg-white">
        <section className="relative bg-mnit-navy py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)",
                backgroundSize: "36px 36px",
              }}
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
                About the Program
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                About CBP <span className="text-mnit-gold">7.0</span>
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

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal variant="left">
                <span className="inline-block rounded-full bg-mnit-light px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
                  Overview
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-mnit-navy sm:text-3xl">
                  A Centralized Event Management System
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    The CBP 7.0 website is a comprehensive centralized event
                    management system designed specifically for managing the
                    Capacity Building Program at MNIT Jaipur. Built to serve{" "}
                    <strong className="text-mnit-navy">400+ first-year students</strong>,
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
                    <strong className="text-mnit-navy">
                      Department of Humanities and Social Sciences
                    </strong>{" "}
                    and the{" "}
                    <strong className="text-mnit-navy">
                      Training &amp; Placement Cell
                    </strong>{" "}
                    at MNIT Jaipur, the platform reflects the
                    institution&apos;s commitment to combining technical
                    innovation with holistic student development.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="right" delay={100}>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                    <Image
                      src="/assets/main-assets/home_1.webp"
                      alt="CBP Program"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-mnit-blue/10 -z-10" />
                  <div className="absolute -top-4 -left-4 h-16 w-16 rounded-2xl bg-mnit-gold/10 -z-10" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-mnit-light py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal>
                <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
                  Platform Features
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
                  Built for Efficiency &amp; Impact
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 text-base leading-relaxed text-gray-600">
                  Every feature is designed to make program management effortless
                  and student engagement meaningful and measurable.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 80}>
                  <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                    <h3 className="text-base font-bold text-mnit-navy">
                      {feature.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
                      {feature.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <span className="inline-block rounded-full bg-mnit-light px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
                  Key Objectives
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
                  Driving Digital Transformation
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 text-base leading-relaxed text-gray-600">
                  The CBP platform pursues clear, measurable objectives to
                  transform how MNIT Jaipur manages its flagship soft skills
                  program for the modern era.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {objectivesList.map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-mnit-blue/20">
                    <h3 className="text-sm font-bold text-mnit-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-mnit-blue py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to Join CBP 7.0?
              </h2>
              <p className="mt-3 text-base text-gray-300">
                Register now and start your journey toward becoming
                industry-ready.
              </p>
              <Link
                href="/registration"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-mnit-gold px-8 py-3.5 text-sm font-bold text-mnit-navy transition duration-200 hover:bg-white hover:shadow-lg"
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
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
