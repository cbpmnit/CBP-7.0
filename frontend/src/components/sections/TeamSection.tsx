import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"

const team = [
  {
    name: "Dr. Niraja Saraswat",
    role: "Faculty Coordinator",
    department: "Dept. of Humanities & Social Sciences",
    image: "/assets/mnit-staff/dr-niraja-saraswat-upper-bg-removed.webp",
  },
  {
    name: "Prof. Nupur Tandon",
    role: "Training & Placement Officer",
    department: "Training & Placement Cell, MNIT Jaipur",
    image: "/assets/mnit-staff/prof-nupur-tandon-head-bg-removed.webp",
  },
  {
    name: "Rakesh",
    role: "Technical Lead",
    department: "Training & Placement Cell, MNIT Jaipur",
    image: "/assets/mnit-staff/rakesh.webp",
  },
]

export default function TeamSection() {
  return (
    <section className="bg-slate-50 py-24 sm:py-32 relative overflow-hidden bg-grid-cyber border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal variant="up">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Meet the <span className="gradient-text-cyan">Advisers</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              The CBP 7.0 is spearheaded by dedicated faculty members and the
              Training &amp; Placement Cell at MNIT Jaipur, ensuring a world-class
              learning experience for every participant.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-10 lg:gap-16">
          {team.map((member, idx) => (
            <Reveal
              key={member.name}
              variant="scale"
              delay={idx * 120}
            >
              <div className="glass-card glass-card-hover rounded-3xl p-8 flex flex-col items-center text-center w-72 group">
                <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-cyan-600/40 shadow-sm transition duration-500 group-hover:scale-105 group-hover:border-cyan-600">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition duration-300">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  {member.role}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 font-sans">
                  {member.department}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
