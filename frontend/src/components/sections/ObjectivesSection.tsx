const objectives = [
  {
    icon: "💻",
    title: "Digitize Workflow",
    description:
      "Replace manual, paper-based processes with a fully digital platform for end-to-end program management — from registration to certificate delivery.",
  },
  {
    icon: "⚡",
    title: "Automate Repetitive Tasks",
    description:
      "Automate student registration, attendance tracking, fee collection, and certificate generation, saving hundreds of person-hours of administrative work.",
  },
  {
    icon: "🤝",
    title: "Enhance Engagement",
    description:
      "Keep 400+ students connected and informed with real-time announcements, session reminders, and interactive digital features throughout the program.",
  },
  {
    icon: "🎓",
    title: "Professional Presence",
    description:
      "Deliver a polished, institution-grade digital experience that reflects MNIT Jaipur&apos;s commitment to academic and professional excellence.",
  },
  {
    icon: "📄",
    title: "Reduce Paperwork",
    description:
      "Transition to a fully paperless workflow with digital registration forms, QR-based attendance, and downloadable e-certificates — saving costs and the environment.",
  },
  {
    icon: "📊",
    title: "Enable Data Analytics",
    description:
      "Gain powerful, actionable insights from attendance rates, session engagement metrics, and program performance dashboards in real time.",
  },
  {
    icon: "📜",
    title: "Automate Certificates",
    description:
      "Instantly generate and distribute personalized, QR-code-verified completion certificates to every participant who meets the attendance criteria.",
  },
  {
    icon: "📣",
    title: "Streamline Communication",
    description:
      "Send targeted announcements, reminders, and updates directly to students, coordinators, and administrators through a unified communication hub.",
  },
]

export default function ObjectivesSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-mnit-light px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
            Key Objectives
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
            What We Aim to Achieve
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The CBP 7.0 platform is built with a clear mission — to transform
            how MNIT Jaipur manages its flagship soft skills program, making it
            more efficient, engaging, and impactful for everyone involved.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {objectives.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg hover:border-mnit-blue/20"
            >
              <span className="text-3xl leading-none">{item.icon}</span>
              <h3 className="mt-4 text-base font-bold text-mnit-navy">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
