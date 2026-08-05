"use client"

import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

const contactInfo = [
  {
    title: "Department",
    value: "Dept. of Humanities & Social Sciences",
    sub: "MNIT Jaipur",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.818a59.906 59.906 0 0110.402 4.768 50.636 50.636 0 00-2.658.813M12 10.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25-2.625a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
      </svg>
    ),
  },
  {
    title: "Address",
    value: "Jawaharlal Nehru Marg, Jaipur",
    sub: "Rajasthan - 302017",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    title: "Email",
    value: "cbp@mnit.ac.in",
    sub: "We typically respond within 24 hours",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Phone",
    value: "+91-141-XXX-XXXX",
    sub: "Mon - Fri, 10:00 AM - 5:00 PM",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.04 12.04 0 01-7.143-7.143c-.162-.441.004-.928.38-1.211l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
]

export default function ContactPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber">
        <section className="bg-black py-24 sm:py-32 relative overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                Contact Us
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Get in <span className="gradient-text-cyan">Touch</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-300">
                Have questions about CBP 7.0? We are here to help. Reach out to
                our organizing team for any queries.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <Reveal>
                  <h2 className="text-3xl font-extrabold text-white">
                    Contact <span className="gradient-text-cyan">Information</span>
                  </h2>
                </Reveal>
                <Reveal delay={80}>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    Reach out to us for any queries regarding CBP 7.0 — whether
                    it is about registration, the program schedule, or general
                    information, we are happy to assist you.
                  </p>
                </Reveal>

                <div className="mt-8 space-y-4">
                  {contactInfo.map((item, i) => (
                    <Reveal key={item.title} delay={120 + i * 60}>
                      <div className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4 items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-mono">{item.title}</p>
                          <p className="text-base font-bold text-white">
                            {item.value}
                          </p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal delay={100} variant="right">
                <div className="glass-card rounded-3xl p-8 sm:p-10 border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-black text-sm font-extrabold shadow-[0_0_15px_#00f0ff]">
                      ✉
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        Send us a Message
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        We will get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Your Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Your Email <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Subject <span className="text-cyan-400">*</span>
                      </label>
                      <select className="mt-2 block w-full rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400">
                        <option>General Inquiry</option>
                        <option>Registration Help</option>
                        <option>Technical Support</option>
                        <option>Feedback</option>
                        <option>Speaker / Volunteer Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Message <span className="text-cyan-400">*</span>
                      </label>
                      <textarea
                        rows={5}
                        required
                        className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl neon-button-cyan py-4 text-sm font-extrabold uppercase tracking-wider"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
