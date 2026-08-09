import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export const metadata = {
  title: "FAQ — CBP 7.0",
  description: "Frequently asked questions about the CBP 7.0 program at MNIT Jaipur.",
}

const faqs = [
  {
    question: "Who can participate in CBP 7.0?",
    answer:
      "CBP 7.0 is exclusively designed for first-year students of MNIT Jaipur. The program complements your first-year curriculum by building essential soft skills required for placements and professional success.",
  },
  {
    question: "What is the duration and format of the program?",
    answer:
      "CBP 7.0 is a comprehensive 5-day intensive program held at the MNIT Jaipur campus. Sessions run during regular academic hours and include a mix of lectures, hands-on workshops, group activities, and interactive discussions.",
  },
  {
    question: "Is there a registration fee?",
    answer:
      "Yes, a nominal registration fee applies to cover program materials, certificates, and session logistics. The exact fee structure and secure payment instructions are shared immediately after successful registration confirmation.",
  },
  {
    question: "Will I receive a certificate upon completion?",
    answer:
      "Yes. All participants maintaining at least 80% attendance and fulfilling all program requirements receive an industry-recognized certificate of completion with a unique QR code for instant digital verification.",
  },
  {
    question: "How can I track my attendance in real time?",
    answer:
      "The CBP platform provides a personal dashboard where you can view your attendance record in real time. Both QR code scans and manual attendance entries are reflected instantly on the centralized system.",
  },
  {
    question: "What happens if I miss a session?",
    answer:
      "Missed sessions can be compensated through designated makeup sessions organized by the team. Your attendance record is automatically updated on the platform once you attend the compensation session.",
  },
  {
    question: "Can I access session materials after the program?",
    answer:
      "Yes. All registered participants receive 6 months of post-program access to session recordings, presentation slides, supplementary reading materials, and workshop resources through their personal dashboard.",
  },
  {
    question: "Who conducts the training sessions?",
    answer:
      "Sessions are led by experienced faculty from the Department of Humanities & Social Sciences, dedicated members of the Training & Placement Cell, and distinguished industry experts specializing in corporate training and leadership development.",
  },
  {
    question: "Is CBP 7.0 conducted online or offline?",
    answer:
      "CBP 7.0 is primarily an in-person program held at the MNIT Jaipur campus. Any scheduled online sessions, if applicable, will be announced in advance and accessible through the platform.",
  },
  {
    question: "How does the CBP platform enhance my experience?",
    answer:
      "The platform provides a unified dashboard for registration, fee payment, attendance tracking, real-time announcements, session schedules, and certificate download — all accessible from one place.",
  },
]

export default function FAQPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-24 sm:py-32 relative overflow-hidden border-b border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Frequently Asked <span className="gradient-text-cyan">Questions</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600">
                Got questions about CBP 7.0? We have compiled everything you
                need to know right here.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 40}>
                  <details className="group glass-card glass-card-hover rounded-2xl open:border-cyan-500/50 open:shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-7 py-5 text-base font-bold text-white select-none">
                      <span className="group-open:text-cyan-300 transition duration-200">
                        {faq.question}
                      </span>
                      <span className="shrink-0 rounded-xl bg-white/5 border border-white/10 p-2 text-cyan-400 transition duration-300 group-open:rotate-180 group-open:bg-cyan-500 group-open:text-black">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-7 pb-6 pt-1 border-t border-white/5">
                      <p className="text-sm leading-relaxed text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
