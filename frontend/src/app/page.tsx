import Hero from "@/components/hero/Hero"
import FeaturesSection from "@/components/sections/FeaturesSection"
import FeedbackSection from "@/components/sections/FeedbackSection"
import ObjectivesSection from "@/components/sections/ObjectivesSection"
import StatsSection from "@/components/sections/StatsSection"
import CTASection from "@/components/sections/CTASection"
import TeamSection from "@/components/sections/TeamSection"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

const programHighlights = [
  {
    title: "Communication Mastery",
    description:
      "Develop articulate verbal and written communication skills — the cornerstone of every successful career. Learn to convey ideas with clarity, confidence, and impact.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.012z" />
      </svg>
    ),
  },
  {
    title: "Critical Thinking",
    description:
      "Build structured problem-solving frameworks and analytical thinking techniques used by top industry leaders to tackle complex challenges.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189M12 12.75V15m0-2.25v-1.5m0 1.5v-1.5m0 1.5V9.75m0 0v-1.5m0 1.5V6.75" />
      </svg>
    ),
  },
  {
    title: "Leadership & Teamwork",
    description:
      "Cultivate collaborative intelligence and leadership presence through immersive group activities, role-plays, and real-world simulations.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.011.447-.032.67A8.997 8.997 0 0112 21a8.997 8.997 0 01-7.319-3.309c-.02-.223-.032-.445-.032-.67V18.72m19.5 0a3 3 0 00-3-3h-15a3 3 0 00-3 3m19.5 0v.243a3 3 0 01-1.07 1.916l-7.5 4.615a3 3 0 01-3.9 0l-7.5-4.615A3 3 0 013.75 19.005V18.72" />
      </svg>
    ),
  },
  {
    title: "Professional Etiquette",
    description:
      "Master the nuances of corporate communication, professional email writing, interview techniques, and workplace decorum expected by Fortune 500 companies.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.3-4.245.464-6.378.464-2.133 0-4.291-.164-6.378-.464-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v4.25m16.5 0a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-4.25" />
      </svg>
    ),
  },
  {
    title: "Emotional Intelligence",
    description:
      "Develop self-awareness, empathy, and resilience — the core emotional competencies that distinguish high-performing individuals in every domain.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: "Career Readiness",
    description:
      "Prepare for placements and internships with resume-building workshops, mock interview sessions, personal branding strategies, and LinkedIn profile optimization.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.818a59.906 59.906 0 0110.402 4.768 50.636 50.636 0 00-2.658.813M12 10.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25-2.625a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        <Hero />

        <StatsSection />

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-mnit-light px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
                About the Program
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
                CBP 7.0 — Capacity Building Program
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                MNIT CBPT 7.0 is a comprehensive 5-day Soft Skills Development
                Program organized by the{" "}
                <strong className="text-mnit-navy">
                  Department of Humanities and Social Sciences
                </strong>{" "}
                in collaboration with the{" "}
                <strong className="text-mnit-navy">
                  Training &amp; Placement Cell, MNIT Jaipur
                </strong>
                . The program bridges the gap between academic learning and
                industry expectations, empowering first-year students with the
                skills that matter most in today&apos;s competitive professional
                landscape.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programHighlights.map((item, i) => (
                <Reveal
                  key={item.title}
                  delay={i * 80}
                  className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:shadow-lg hover:border-mnit-blue/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mnit-blue/10 text-mnit-blue transition duration-300 group-hover:bg-mnit-blue group-hover:text-white">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 text-base font-bold text-mnit-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />
        <FeedbackSection />
        <ObjectivesSection />
        <TeamSection />
        <CTASection />
      </main>
    </PageTransition>
  )
}
