import Image from "next/image"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export const metadata = {
  title: "About Us | CBP 7.0",
  description:
    "Learn about the Capacity Building Program — an immersive journey from academic knowledge to professional mastery.",
}

const skillsList = [
  {
    title: "Communication",
    desc: "Articulate complex ideas and build consensus.",
  },
  {
    title: "Teamwork",
    desc: "Navigate group dynamics and drive success.",
  },
  {
    title: "Adaptability",
    desc: "Embrace change and bounce back with resilience.",
  },
  {
    title: "Leadership",
    desc: "Inspire action and guide teams towards vision.",
  },
]

const commitmentList = [
  {
    title: "Expert Talks",
    desc: "Engage with seasoned industry leaders.",
  },
  {
    title: "Interactive Workshops",
    desc: "Hands-on simulations, role-play, and case studies.",
  },
  {
    title: "Exclusive Resources",
    desc: "A digital library of eBooks and curated materials.",
  },
  {
    title: "Networking",
    desc: "Forge connections with future leaders.",
  },
]

const legacyList = [
  { title: "Strategic Partnerships", desc: "Forging strategic partnerships with industry." },
  { title: "High-Impact Programs", desc: "Orchestrating high-impact programs." },
  { title: "Exceptional Careers", desc: "Guiding students to exceptional careers." },
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
                About <span className="gradient-text-cyan">Us</span>
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-4 text-2xl font-semibold text-slate-800">
                Architecting the Leaders of Tomorrow
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-slate-600 sm:text-lg">
                Welcome to the Capacity Building Program, a premier 4-day initiative crafted by the Department of Humanities and Social Sciences in collaboration with the Training & Placement Cell of MNIT Jaipur. More than a workshop — an immersive journey from academic knowledge to professional mastery.
              </p>
            </Reveal>
          </div>
        </section>

        {/* The Modern Imperative */}
        <section className="py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <Reveal variant="left">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  The Modern Imperative: <span className="gradient-text-cyan">Why Soft Skills Define Success</span>
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                  <p>
                    The world&apos;s most innovative and influential leaders unanimously agree that soft skills are indispensable. They are the underlying operating system for a successful career and a fulfilling life.
                  </p>
                  
                  <blockquote className="mt-6 border-l-4 border-cyan-500 pl-4 italic text-slate-700 bg-slate-100/50 p-4 rounded-r-lg">
                    “Your degree can get you the interview. Your soft skills will get you the job.”<br/>
                    <span className="font-semibold text-sm text-cyan-700 block mt-2">— Satya Nadella</span>
                  </blockquote>
                  <blockquote className="mt-4 border-l-4 border-blue-500 pl-4 italic text-slate-700 bg-slate-100/50 p-4 rounded-r-lg">
                    “Emotional intelligence is more important than IQ in achieving success.”<br/>
                    <span className="font-semibold text-sm text-blue-700 block mt-2">— Daniel Goleman</span>
                  </blockquote>
                  <blockquote className="mt-4 border-l-4 border-indigo-500 pl-4 italic text-slate-700 bg-slate-100/50 p-4 rounded-r-lg">
                    “The ability to communicate effectively is the most important skill any engineer can have.”<br/>
                    <span className="font-semibold text-sm text-indigo-700 block mt-2">— Elon Musk</span>
                  </blockquote>
                </div>
              </Reveal>

              {/* High-Tech Video Showcase Frame */}
              <Reveal variant="right" delay={100}>
                <div className="relative group">
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

        {/* The Architecture of Excellence */}
        <section className="bg-white py-24 sm:py-32 border-t border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  The Architecture of Excellence: <span className="gradient-text-cyan">Deconstructing Soft Skills</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
                  Soft skills are the sophisticated personal and interpersonal attributes that govern how we interact, perform, and lead.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {skillsList.map((skill, i) => (
                <Reveal key={skill.title} delay={i * 80}>
                  <div className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between h-full group text-center sm:text-left border-t-4 border-t-cyan-500">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition duration-300">
                        {skill.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {skill.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Your Journey of Growth */}
        <section className="py-24 sm:py-32 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Your Journey of Growth: <span className="gradient-text-cyan">Our Commitment</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
                  We don’t just teach soft skills — we provide a structured environment where you can practice, refine, and master them.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {commitmentList.map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="glass-card glass-card-hover rounded-2xl p-6 text-center sm:text-left bg-white shadow-sm border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Foundation */}
        <section className="bg-white py-24 sm:py-32 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Our Foundation: <span className="gradient-text-cyan">The Training & Placement Cell, MNIT</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
                  The T&amp;P Cell is the central nervous system for career development at MNIT, with a legacy of:
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-1 md:grid-cols-3">
              {legacyList.map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="flex flex-col items-center p-6 text-center rounded-2xl bg-slate-50 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        {/* CTA */}
        <section className="relative py-32 overflow-hidden border-t border-slate-200">
          {/* Ascent Vibe Background Orbs (Light Mode) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-300/30 blur-[120px]" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-300/30 blur-[130px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-200/40 blur-[150px] animate-pulse" />
          </div>

          <div className="relative mx-auto max-w-5xl px-5 lg:px-8 z-10">
            <Reveal>
              <div className="glass-card rounded-[2.5rem] p-10 sm:p-16 md:p-20 border border-white/40 bg-white/40 backdrop-blur-2xl text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-transparent opacity-50 transition-opacity duration-700 group-hover:opacity-100" />
                
                <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Our Mission: <br className="sm:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 drop-shadow-sm">
                    Empowering Your Ascent 🚀
                  </span>
                </h2>
                
                <p className="relative mt-8 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                  True capacity is built at the intersection of knowledge and character. Leave with confidence, a strategic network, and a roadmap for your ascent.
                </p>
                
                <div className="relative mt-12 flex justify-center">
                  <Link
                    href="/register"
                    className="group/btn flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-9 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white"
                  >
                    <span>Join Us & Architect Your Future</span>
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
