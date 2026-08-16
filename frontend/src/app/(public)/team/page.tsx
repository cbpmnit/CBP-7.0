"use client"

import { useState } from "react"
import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"


type TeamMember = {
  src: string
  name: string
  role: string
  category: "organizers" | "faculty" | "representatives" | "participants"
  span?: string
}

const teamMembers: TeamMember[] = [
  { src: "/assets/mnit-staff/dr-niraja-saraswat-upper-bg-removed.webp", name: "Dr. Niraja Saraswat", role: "Faculty Coordinator", category: "faculty", span: "md:col-span-2 md:row-span-2" },
  { src: "/assets/mnit-staff/prof-nupur-tandon-head-bg-removed.webp", name: "Prof. Nupur Tandon", role: "TPO Officer", category: "faculty" },
  { src: "/assets/mnit-staff/rakesh.webp", name: "Rakesh", role: "Technical Lead", category: "organizers" },
  { src: "/assets/seniors/DeekshaSinghal.webp", name: "Diksha Gupta", role: "Alumni Representative", category: "representatives" },
  { src: "/assets/seniors/Akash Kumar.webp", name: "Saurav Raj", role: "Alumni Representative", category: "representatives" },
  { src: "/assets/seniors/ansh.webp", name: "Amit Tiwari", role: "Alumni Representative", category: "representatives" },
  { src: "/assets/seniors/TusharChoudhary.webp", name: "Kuldeep Dadrwal", role: "Alumni Representative", category: "representatives" },
  { src: "/assets/seniors/AdityaRoy.webp", name: "Aditya Roy", role: "Participant", category: "participants" },
  { src: "/assets/seniors/AryanRaj.webp", name: "Aryan Raj", role: "Participant", category: "participants" },
  { src: "/assets/seniors/ashana.webp", name: "Ashana", role: "Participant", category: "participants" },
  { src: "/assets/seniors/BalveerSaini.webp", name: "Balveer Saini", role: "Participant", category: "participants" },
  { src: "/assets/seniors/BhaveshNarnolia.webp", name: "Bhavesh Narnolia", role: "Participant", category: "participants" },
  { src: "/assets/seniors/BhaveshYadav.webp", name: "Bhavesh Yadav", role: "Participant", category: "participants" },
  { src: "/assets/seniors/HardikDhoot.webp", name: "Hardik Dhoot", role: "Participant", category: "participants" },
  { src: "/assets/seniors/Hardik.webp", name: "Hardik", role: "Participant", category: "participants" },
  { src: "/assets/seniors/HaroonKaragwal.webp", name: "Haroon Karagwal", role: "Participant", category: "participants" },
  { src: "/assets/seniors/HarshitKumar.webp", name: "Harshit Kumar", role: "Participant", category: "participants" },
  { src: "/assets/seniors/harsh.webp", name: "Harsh", role: "Participant", category: "participants" },
  { src: "/assets/seniors/KanikaSinghal.webp", name: "Kanika Singhal", role: "Participant", category: "participants" },
  { src: "/assets/seniors/KomalWankhede.webp", name: "Komal Wankhede", role: "Participant", category: "participants" },
  { src: "/assets/seniors/KoshalSharma.webp", name: "Koshal Sharma", role: "Participant", category: "participants" },
  { src: "/assets/seniors/KrishnaAgarwal.webp", name: "Krishna Agarwal", role: "Participant", category: "participants" },
  { src: "/assets/seniors/KrupaJoshi.webp", name: "Krupa Joshi", role: "Participant", category: "participants" },
  { src: "/assets/seniors/KushalGarg.webp", name: "Kushal Garg", role: "Participant", category: "participants" },
  { src: "/assets/seniors/NaveenSaini.webp", name: "Naveen Saini", role: "Participant", category: "participants" },
  { src: "/assets/seniors/NehaTripathi.webp", name: "Neha Tripathi", role: "Participant", category: "participants" },
  { src: "/assets/seniors/nikesh.webp", name: "Nikesh", role: "Participant", category: "participants" },
  { src: "/assets/seniors/nikhil.webp", name: "Nikhil", role: "Participant", category: "participants" },
  { src: "/assets/seniors/ParvAgrawal.webp", name: "Parv Agrawal", role: "Participant", category: "participants" },
  { src: "/assets/seniors/priyanka.webp", name: "Priyanka", role: "Participant", category: "participants" },
  { src: "/assets/seniors/RakshitJain.webp", name: "Rakshit Jain", role: "Participant", category: "participants" },
  { src: "/assets/seniors/Ruby Gupta.webp", name: "Ruby Gupta", role: "Participant", category: "participants" },
  { src: "/assets/seniors/RushilSinha.webp", name: "Rushil Sinha", role: "Participant", category: "participants" },
  { src: "/assets/seniors/VimalDubey.webp", name: "Vimal Dubey", role: "Participant", category: "participants" },
  { src: "/assets/seniors/VivekTapaniya.webp", name: "Vivek Tapaniya", role: "Participant", category: "participants" },
]

const categories = [
  { id: "all", label: "All Members" },
  { id: "faculty", label: "Faculty & Advisors" },
  { id: "organizers", label: "Organizers & Leads" },
  { id: "representatives", label: "Alumni Representatives" },
  { id: "participants", label: "Participants" },
]

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<string>("all")

  const filteredMembers = activeTab === "all"
    ? teamMembers
    : teamMembers.filter((member) => member.category === activeTab)

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        {/* Banner */}
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-24 sm:py-32 relative overflow-hidden border-b border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Our <span className="gradient-text-cyan">Team</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600">
                Meet the passionate individuals, faculty, and student representatives who make CBP 7.0 at MNIT Jaipur a grand success.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Team Content */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
              {categories.map((cat) => {
                const isActive = activeTab === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? "neon-button-cyan scale-105 shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-cyan-500/40 hover:text-cyan-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Masonry / Grid Layout */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[280px]">
              {filteredMembers.map((member, idx) => (
                <Reveal key={member.src + idx} delay={(idx % 6) * 60}>
                  <div
                    className={`group relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900 transition-all duration-500 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] ${
                      member.span || ""
                    }`}
                  >
                    <Image
                      src={member.src}
                      alt={member.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition duration-300 group-hover:opacity-100 flex flex-col justify-end p-5">
                      <p className="text-lg font-bold text-white drop-shadow-[0_0_10px_#00f0ff]">
                        {member.name}
                      </p>
                      <span className="text-xs font-sans font-medium uppercase tracking-widest text-cyan-400 mt-1">
                        {member.role}
                      </span>
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
