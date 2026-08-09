"use client"

import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

type Speaker = {
  name: string
  designation: string
  image: string | null
}

const speakers: Speaker[] = [
  {
    name: "Mr. Munish Nandwani",
    designation: "Director, Hindustan Unilever Limited",
    image: "/assets/speakers-v2/munish-nandwani-directior-hindustan-unilever-limited.webp",
  },
  {
    name: "Mr. Mahesh Punjabi",
    designation: "Vice President Infosys, Gold Medalist IIT Delhi",
    image: "/assets/speakers-v2/mahesh-punjabi-vice-president-infosys-gold-medalist-iit-delhi.webp",
  },
  {
    name: "Adv. Anuj Saxena",
    designation: "Advocate on Record - Supreme Court of India",
    image: "/assets/speakers-v2/advocate-anuj-saxena-advocate-on-record-supreme-court-of-india.webp",
  },
  {
    name: "Dr. Anupama Soni",
    designation: "Mrs. Asia International 2018",
    image: "/assets/speakers-v2/dr-anupama-sono-mrs-asia-international-2018-mrs-india-2018.webp",
  },
  {
    name: "Mr. Hari Bhakti Das",
    designation: "Director at ISKCON Jaipur",
    image: "/assets/speakers-v2/haribhakti-das-director-at-iskcon-jaipur.webp",
  },
  {
    name: "Mr. Hemant Kumar",
    designation: "Alumni IIT Bombay",
    image: "/assets/speakers-v2/hemant-kumar-alumini-iit-bombay.webp",
  },
  {
    name: "Sh. Chakravarti Das",
    designation: "Practicing ISKCON Monk & Life Coach",
    image: "/assets/speakers-v2/chakravarti-das-practicing-iskcon-monk-life-coach-and-spiritual-teacher.webp",
  },
  {
    name: "Mr. Mohit Kumar",
    designation: "Gold Medalist, IIT Roorkee",
    image: "/assets/speakers-v2/mohit-kumar-gold-medalist-iit-rurkee.webp",
  },
  {
    name: "Pancharatna Das",
    designation: "Spiritual Mentor",
    image: "/assets/speakers-v2/pancharatna-das.webp",
  },
  { 
    name: "Mr. Sanjay Pungliya", 
    designation: "Speaker", 
    image: null 
  },
  { 
    name: "Mr. Ravi Kumar", 
    designation: "Speaker", 
    image: null 
  },
  { 
    name: "Mrs. Vibhuti Mehra", 
    designation: "Speaker", 
    image: null 
  },
  { 
    name: "Mr. Rajat Gupta", 
    designation: "Motivational Speaker", 
    image: null 
  },
  { 
    name: "Mr. Aditya Jha", 
    designation: "Motivational Speaker", 
    image: null 
  },
  { 
    name: "Mr. Amogh Lila Das", 
    designation: "Spiritual Mentor", 
    image: null 
  },
  { 
    name: "Prof. Jyoti Pahwa", 
    designation: "Professor", 
    image: null 
  },
]

// Helper to remove prefixes like "Mr." or "Dr." before grabbing initials
function getInitials(name: string) {
  const cleanName = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Adv\.|Sh\.|Prof\.)\s+/i, "")
  return cleanName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col items-center text-center group h-full">
      <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-cyan-600/40 shadow-sm transition duration-500 group-hover:scale-105 group-hover:border-cyan-600">
        {speaker.image ? (
          <Image
            src={speaker.image}
            alt={speaker.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cyan-100 text-cyan-700 text-2xl font-bold transition duration-500 group-hover:scale-110">
            {getInitials(speaker.name)}
          </div>
        )}
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition duration-300">
        {speaker.name}
      </h3>
      <p className="mt-1 text-sm font-sans text-slate-600">{speaker.designation}</p>
    </div>
  )
}

// Ensure you export metadata in layout.tsx or a separate file if using "use client"
// export const metadata = {
//   title: "Speakers — CBP 7.0",
//   description: "Meet our distinguished speakers from CBP programs.",
// }

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
                mentors who have graced our programs.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {speakers.map((speaker, i) => (
                <Reveal key={speaker.name} delay={(i % 4) * 60}>
                  <SpeakerCard speaker={speaker} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
