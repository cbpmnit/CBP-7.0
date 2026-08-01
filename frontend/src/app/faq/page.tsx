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
      <main className="min-h-screen bg-white">
        <section className="bg-mnit-navy py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
                FAQ
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Frequently Asked{" "}
                <span className="text-mnit-gold">Questions</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-300">
                Got questions about CBP 7.0? We have compiled everything you
                need to know right here.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 40}>
                  <details className="group rounded-2xl border border-gray-100 bg-white shadow-sm open:border-mnit-blue/20 open:shadow-md">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-sm sm:text-base select-none">
                      <span className="font-semibold text-mnit-navy pr-4">
                        {faq.question}
                      </span>
                      <span className="shrink-0 rounded-lg bg-mnit-light p-1.5 text-gray-400 transition duration-200 group-open:rotate-180 group-open:bg-mnit-blue group-open:text-white">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-gray-600">
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
