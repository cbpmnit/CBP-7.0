import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export const metadata = {
  title: "Schedule — CBP 7.0",
  description: "5-day schedule for the Capacity Building Program 7.0 at MNIT Jaipur.",
}

const scheduleDays = [
  {
    day: "Day 1",
    tag: "Orientation & Ice-Breaking",
    sessions: [
      { time: "09:00 AM", topic: "Inaugural Address", speaker: "Dr. Niraja Saraswat", venue: "Main Auditorium, MNIT" },
      { time: "10:30 AM", topic: "Ice-Breaking Activities & Team Formation", speaker: "Student Coordinators", venue: "Seminar Hall" },
      { time: "02:00 PM", topic: "Introduction to Soft Skills & Program Overview", speaker: "Prof. Nupur Tandon", venue: "Main Auditorium" },
    ],
  },
  {
    day: "Day 2",
    tag: "Communication & Expression",
    sessions: [
      { time: "09:00 AM", topic: "Effective Verbal Communication Workshop", speaker: "Industry Expert", venue: "Seminar Hall" },
      { time: "11:00 AM", topic: "Written Communication & Email Etiquette", speaker: "Faculty, HSS Dept", venue: "Lab Complex" },
      { time: "02:00 PM", topic: "Group Discussions & Structured Debates", speaker: "Student Coordinators", venue: "Seminar Hall" },
    ],
  },
  {
    day: "Day 3",
    tag: "Leadership & Teamwork",
    sessions: [
      { time: "09:00 AM", topic: "Leadership Principles & Styles", speaker: "Industry Expert", venue: "Main Auditorium" },
      { time: "11:00 AM", topic: "Team Building Activities & Outdoor Exercises", speaker: "Training & Placement Cell", venue: "Sports Complex" },
      { time: "02:00 PM", topic: "Case Study Discussions on Leadership", speaker: "Faculty, HSS Dept", venue: "Seminar Hall" },
    ],
  },
  {
    day: "Day 4",
    tag: "Professional Skills & Etiquette",
    sessions: [
      { time: "09:00 AM", topic: "Resume Building & LinkedIn Optimization", speaker: "Training & Placement Cell", venue: "Computer Lab" },
      { time: "11:00 AM", topic: "Interview Preparation & Techniques", speaker: "Industry Expert", venue: "Main Auditorium" },
      { time: "02:00 PM", topic: "Mock Interview Sessions (Panel-based)", speaker: "TPO Team & Industry Mentors", venue: "Placement Office" },
    ],
  },
  {
    day: "Day 5",
    tag: "Certification & Valedictory",
    sessions: [
      { time: "09:00 AM", topic: "Personality Development & Self-Branding", speaker: "Industry Expert", venue: "Main Auditorium" },
      { time: "11:00 AM", topic: "Feedback, Assessment & Q&A", speaker: "CBP Organizing Team", venue: "Seminar Hall" },
      { time: "02:00 PM", topic: "Valedictory Ceremony & Certificate Distribution", speaker: "Dr. Niraja Saraswat & Prof. Nupur Tandon", venue: "Main Auditorium" },
    ],
  },
]

export default function SchedulePage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber">
        <section className="bg-black py-24 sm:py-32 relative overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                5-Day Program
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Program <span className="gradient-text-cyan">Schedule</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-300">
                A carefully crafted 5-day itinerary covering communication,
                leadership, professionalism, and career readiness — everything
                you need to stand out.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="space-y-8">
              {scheduleDays.map((day, di) => (
                <Reveal key={day.day} delay={di * 100}>
                  <div className="glass-card glass-card-hover rounded-3xl overflow-hidden">
                    <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-6 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="shrink-0 rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3.5 py-1 text-xs font-extrabold text-cyan-300 uppercase tracking-wider w-fit shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                        {day.day}
                      </span>
                      <h3 className="text-lg font-extrabold text-white">
                        {day.tag}
                      </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {day.sessions.map((session, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 hover:bg-white/5 transition duration-200"
                        >
                          <span className="shrink-0 text-sm font-bold text-cyan-400 font-mono w-28">
                            {session.time}
                          </span>
                          <div className="flex-1">
                            <p className="text-base font-bold text-white">
                              {session.topic}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {session.speaker}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-gray-300 w-fit">
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
