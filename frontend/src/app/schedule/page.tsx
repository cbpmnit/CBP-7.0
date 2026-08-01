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
      { time: "11:00 AM", topic: "Feedback, Assessment & Q&amp;A", speaker: "CBP Organizing Team", venue: "Seminar Hall" },
      { time: "02:00 PM", topic: "Valedictory Ceremony & Certificate Distribution", speaker: "Dr. Niraja Saraswat & Prof. Nupur Tandon", venue: "Main Auditorium" },
    ],
  },
]

export default function SchedulePage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        <section className="bg-mnit-navy py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
                5-Day Program
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Program <span className="text-mnit-gold">Schedule</span>
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
            <div className="space-y-6">
              {scheduleDays.map((day, di) => (
                <Reveal key={day.day} delay={di * 100}>
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="bg-mnit-blue px-6 py-4 sm:px-8 sm:py-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className="shrink-0 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-mnit-gold w-fit">
                          {day.day}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {day.tag}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {day.sessions.map((session, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-8"
                        >
                          <span className="shrink-0 text-sm font-semibold text-mnit-blue w-24">
                            {session.time}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-mnit-navy">
                              {session.topic}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {session.speaker}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-md bg-mnit-light px-3 py-1 text-xs font-medium text-gray-600 w-fit">
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
