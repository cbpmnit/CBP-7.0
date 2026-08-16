import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export const metadata = {
  title: "Schedule — CBP 7.0",
  description: "4-day schedule for the Capacity Building Program 7.0 at MNIT Jaipur.",
}

const scheduleDays = [
  {
    day: "Day 1 (31 Aug)",
    tag: "Secrets of Life",
    sessions: [
      { time: "06:00 PM - 07:30 PM", topic: "Secrets of Life", speaker: "Mr. Munish Nandwani", venue: "Ramanujan Hall, VLTC" },
    ],
  },
  {
    day: "Day 2 (1 Sep)",
    tag: "Game of Mind + Drama",
    sessions: [
      { time: "06:00 PM - 07:30 PM", topic: "Game of Mind + Drama", speaker: "HG Aravindaksha Madhav Das", venue: "Ramanujan Hall, VLTC" },
    ],
  },
  {
    day: "Day 3 (2 Sep)",
    tag: "Search for Happiness",
    sessions: [
      { time: "06:00 PM - 07:30 PM", topic: "Search for Happiness", speaker: "Adv. Anuj Saxena", venue: "Ramanujan Hall, VLTC" },
    ],
  },
  {
    day: "Day 4 (3 Sep)",
    tag: "Placement Strategy + Mega Quiz",
    sessions: [
      { time: "06:00 PM - 07:30 PM", topic: "Placement Strategy + Mega Quiz", speaker: "Ms. Jyoti Pahwa", venue: "Ramanujan Hall, VLTC" },
    ],
  },
]

export default function SchedulePage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-24 sm:py-32 relative overflow-hidden border-b border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Program <span className="gradient-text-cyan">Schedule</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600">
                A carefully crafted 4-day itinerary covering the true secrets of life,
                mental resilience, finding happiness, and elite placement strategy.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="space-y-8">
              {scheduleDays.map((day, di) => (
                <Reveal key={day.day} delay={di * 100}>
                  <div className="glass-card glass-card-hover rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200">
                    <div className="bg-cyan-50/50 border-b border-cyan-100 px-6 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="shrink-0 rounded-lg bg-cyan-100 border border-cyan-200 px-3.5 py-1 text-xs font-extrabold text-cyan-800 uppercase tracking-wider w-fit">
                        {day.day}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {day.tag}
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {day.sessions.map((session, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 hover:bg-slate-50 transition duration-200"
                        >
                          <span className="shrink-0 text-sm font-bold text-cyan-600 font-mono w-40">
                            {session.time}
                          </span>
                          <div className="flex-1">
                            <p className="text-base font-bold text-slate-900">
                              {session.speaker}
                            </p>
                            <p className="text-xs font-semibold text-cyan-700 mt-1">
                              {session.topic}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 w-fit">
                            {session.venue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
