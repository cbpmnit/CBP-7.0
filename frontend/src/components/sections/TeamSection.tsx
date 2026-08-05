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
    <section className="bg-black py-24 sm:py-32 relative overflow-hidden bg-grid-cyber border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal variant="scale">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-medium text-cyan-300 uppercase tracking-widest backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              Our Leadership
            </span>
          </Reveal>
          
          <Reveal variant="up" delay={80}>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Meet the <span className="gradient-text-cyan">Advisers</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
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
                <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition duration-500 group-hover:scale-105 group-hover:border-cyan-400">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-6 text-lg font-medium text-white group-hover:text-cyan-300 transition duration-300">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.4)]">
                  {member.role}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-400 font-sans">
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
