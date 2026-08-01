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

function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  return (
    <div className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg hover:border-mnit-blue/20 text-center">
      <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-mnit-light shadow-md transition duration-500 group-hover:border-mnit-blue/30 group-hover:shadow-xl">
        {speaker.image ? (
          <Image
            src={speaker.image}
            alt={speaker.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-mnit-light text-mnit-blue text-xl font-bold">
            {speaker.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
      </div>
      <h3 className="mt-4 text-sm font-bold text-mnit-navy">{speaker.name}</h3>
      <p className="mt-1 text-xs text-gray-500">{speaker.designation}</p>
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
      <main className="min-h-screen bg-white">
        <section className="bg-mnit-navy py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
            <Reveal>
              <span className="inline-block rounded-full border border-mnit-gold/40 bg-mnit-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-mnit-gold">
                Past Speakers
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Our <span className="text-mnit-gold">Speakers</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-300">
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
                    <span className="text-5xl font-bold text-mnit-blue">
                      {group.year}
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                </Reveal>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {group.speakers.map((speaker, i) => (
                    <Reveal key={speaker.name} delay={i * 60}>
                      <SpeakerCard speaker={speaker} index={i} />
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
