import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

type Speaker = {
  name: string
  designation: string
  image: string | null
}

const yearGroups: { year: string; speakers: Speaker[] }[] = [
  {
    year: "2025",
    speakers: [
      { name: "Mr. Munish Nandwani", designation: "Life Coach & Speaker", image: "/assets/speakers/mr. munish nandwani.webp" },
      { name: "Mr. Mahesh Punjabi", designation: "Communication Expert", image: "/assets/speakers/mr. mahesh punjabi .webp" },
      { name: "Adv. Anuj Saxena", designation: "Advocate", image: "/assets/speakers/advocate anuj saxena.webp" },
      { name: "Dr. Anupama Soni", designation: "Doctor & Speaker", image: "/assets/speakers/dr. anupama soni.webp" },
      { name: "Mr. Hari Bhakti Das", designation: "Spiritual Mentor", image: "/assets/speakers/mr. hari bhakti das.webp" },
    ],
  },
  {
    year: "2024",
    speakers: [
      { name: "Mr. Munish Nandwani", designation: "Life Coach & Speaker", image: "/assets/speakers/mr. munish nandwani.webp" },
      { name: "Mr. Mahesh Punjabi", designation: "Communication Expert", image: "/assets/speakers/mr. mahesh punjabi .webp" },
      { name: "Mr. Hari Bhakti Das", designation: "Spiritual Mentor", image: "/assets/speakers/mr. hari bhakti das.webp" },
      { name: "Mr. Hemant Kumar", designation: "Speaker", image: "/assets/speakers/hemant kumar.webp" },
      { name: "Mr. Sanjay Pungliya", designation: "Speaker", image: null },
    ],
  },
  {
    year: "2023",
    speakers: [
      { name: "Sh. Chakravarti Das", designation: "Spiritual Mentor & Leadership Coach", image: "/assets/speakers/mr. chakravarti das.webp" },
      { name: "Mr. Mohit Kumar", designation: "Productivity Expert", image: null },
      { name: "Mr. Ravi Kumar", designation: "Speaker", image: "/assets/speakers/mr. ravi kumar.webp" },
      { name: "Mrs. Vibhuti Mehra", designation: "Speaker", image: "/assets/speakers/mrs. vibhuti mehra.webp" },
    ],
  },
  {
    year: "2022",
    speakers: [
      { name: "Mr. Chakravarti Das", designation: "Spiritual Mentor", image: "/assets/speakers/mr. chakravarti das.webp" },
      { name: "Mr. Rajat Gupta", designation: "Motivational Speaker", image: "/assets/speakers/mr. rajat gupta.webp" },
      { name: "Mr. Aditya Jha", designation: "Motivational Speaker", image: "/assets/speakers/mr. aditya jha.webp" },
    ],
  },
  {
    year: "2021",
    speakers: [
      { name: "Mr. Amogh Lila Das", designation: "Spiritual Mentor", image: "/assets/speakers/amogh-lila-das.webp" },
      { name: "Prof. Jyoti Pahwa", designation: "Professor", image: "/assets/speakers/professor jyoti pahwa.webp" },
      { name: "Mr. Rajat Gupta", designation: "Motivational Speaker", image: "/assets/speakers/mr. rajat gupta.webp" },
      { name: "Mr. Munish Nandwani", designation: "Life Coach & Speaker", image: "/assets/speakers/mr. munish nandwani.webp" },
      { name: "Mr. Chakravarti Das", designation: "Spiritual Mentor", image: "/assets/speakers/mr. chakravarti das.webp" },
      { name: "Mr. Aditya Jha", designation: "Motivational Speaker", image: "/assets/speakers/mr. aditya jha.webp" },
    ],
  },
]

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col items-center text-center group">
      <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition duration-500 group-hover:scale-105 group-hover:border-cyan-400">
        {speaker.image ? (
          <Image
            src={speaker.image}
            alt={speaker.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cyan-500/20 text-cyan-300 text-xl font-bold">
            {speaker.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
      </div>
      <h3 className="mt-5 text-base font-extrabold text-white group-hover:text-cyan-300 transition duration-300">
        {speaker.name}
      </h3>
      <p className="mt-1 text-xs font-mono text-gray-400">{speaker.designation}</p>
    </div>
  )
}

export const metadata = {
  title: "Speakers — CBP 7.0",
  description: "Meet our distinguished past speakers from CBP programs across the years.",
}

export default function SpeakersPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-24 sm:py-32 relative overflow-hidden border-b border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Our <span className="gradient-text-cyan">Speakers</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600">
                Distinguished academicians, industry leaders, and spiritual
                mentors who have graced CBP programs from 2021 to 2025.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 space-y-20">
            {yearGroups.map((group) => (
              <div key={group.year}>
                <Reveal>
                  <div className="flex items-center gap-4 mb-10">
                    <span className="text-5xl font-black gradient-text-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                      {group.year}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
                  </div>
                </Reveal>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {group.speakers.map((speaker, i) => (
                    <Reveal key={speaker.name} delay={i * 60}>
                      <SpeakerCard speaker={speaker} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
