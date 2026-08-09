"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi"

type GalleryItem = {
  src: string
  alt: string
  category: "highlights" | "students" | "faculty"
  span?: string
}

const galleryImages: GalleryItem[] = [
  { src: "/assets/mnit-staff/cbp photos.webp", alt: "CBP 7.0 Grand Inauguration", category: "highlights", span: "md:col-span-2 md:row-span-2" },
  { src: "/assets/mnit-staff/3.webp", alt: "Special Guest Session & Keynote", category: "highlights" },
  { src: "/assets/main-assets/home_1.webp", alt: "Capacity Building Interactive Session", category: "highlights" },
  { src: "/assets/main-assets/home_2.webp", alt: "Soft Skills & Leadership Workshop", category: "highlights" },
  { src: "/assets/mnit-staff/dr-niraja-saraswat-upper-bg-removed.webp", alt: "Dr. Niraja Saraswat — Faculty Coordinator", category: "faculty" },
  { src: "/assets/mnit-staff/prof-nupur-tandon-head-bg-removed.webp", alt: "Prof. Nupur Tandon — TPO Officer", category: "faculty" },
  { src: "/assets/mnit-staff/rakesh.webp", alt: "Rakesh — Technical Lead", category: "faculty" },
  { src: "/assets/seniors/DeekshaSinghal.webp", alt: "Diksha Gupta — Alumni Representative", category: "students" },
  { src: "/assets/seniors/Akash Kumar.webp", alt: "Saurav Raj — Alumni Representative", category: "students" },
  { src: "/assets/seniors/ansh.webp", alt: "Amit Tiwari — Alumni Representative", category: "students" },
  { src: "/assets/seniors/TusharChoudhary.webp", alt: "Kuldeep Dadrwal — Alumni Representative", category: "students" },
  { src: "/assets/seniors/AdityaRoy.webp", alt: "Aditya Roy — CBP Participant", category: "students" },
  { src: "/assets/seniors/AryanRaj.webp", alt: "Aryan Raj — CBP Participant", category: "students" },
  { src: "/assets/seniors/ashana.webp", alt: "Ashana — CBP Participant", category: "students" },
  { src: "/assets/seniors/BalveerSaini.webp", alt: "Balveer Saini — CBP Participant", category: "students" },
  { src: "/assets/seniors/BhaveshNarnolia.webp", alt: "Bhavesh Narnolia — CBP Participant", category: "students" },
  { src: "/assets/seniors/BhaveshYadav.webp", alt: "Bhavesh Yadav — CBP Participant", category: "students" },
  { src: "/assets/seniors/HardikDhoot.webp", alt: "Hardik Dhoot — CBP Participant", category: "students" },
  { src: "/assets/seniors/Hardik.webp", alt: "Hardik — CBP Participant", category: "students" },
  { src: "/assets/seniors/HaroonKaragwal.webp", alt: "Haroon Karagwal — CBP Participant", category: "students" },
  { src: "/assets/seniors/HarshitKumar.webp", alt: "Harshit Kumar — CBP Participant", category: "students" },
  { src: "/assets/seniors/harsh.webp", alt: "Harsh — CBP Participant", category: "students" },
  { src: "/assets/seniors/KanikaSinghal.webp", alt: "Kanika Singhal — CBP Participant", category: "students" },
  { src: "/assets/seniors/KomalWankhede.webp", alt: "Komal Wankhede — CBP Participant", category: "students" },
  { src: "/assets/seniors/KoshalSharma.webp", alt: "Koshal Sharma — CBP Participant", category: "students" },
  { src: "/assets/seniors/KrishnaAgarwal.webp", alt: "Krishna Agarwal — CBP Participant", category: "students" },
  { src: "/assets/seniors/KrupaJoshi.webp", alt: "Krupa Joshi — CBP Participant", category: "students" },
  { src: "/assets/seniors/KushalGarg.webp", alt: "Kushal Garg — CBP Participant", category: "students" },
  { src: "/assets/seniors/NaveenSaini.webp", alt: "Naveen Saini — CBP Participant", category: "students" },
  { src: "/assets/seniors/NehaTripathi.webp", alt: "Neha Tripathi — CBP Participant", category: "students" },
  { src: "/assets/seniors/nikesh.webp", alt: "Nikesh — CBP Participant", category: "students" },
  { src: "/assets/seniors/nikhil.webp", alt: "Nikhil — CBP Participant", category: "students" },
  { src: "/assets/seniors/ParvAgrawal.webp", alt: "Parv Agrawal — CBP Participant", category: "students" },
  { src: "/assets/seniors/priyanka.webp", alt: "Priyanka — CBP Participant", category: "students" },
  { src: "/assets/seniors/RakshitJain.webp", alt: "Rakshit Jain — CBP Participant", category: "students" },
  { src: "/assets/seniors/Ruby Gupta.webp", alt: "Ruby Gupta — CBP Participant", category: "students" },
  { src: "/assets/seniors/RushilSinha.webp", alt: "Rushil Sinha — CBP Participant", category: "students" },
  { src: "/assets/seniors/VimalDubey.webp", alt: "Vimal Dubey — CBP Participant", category: "students" },
  { src: "/assets/seniors/VivekTapaniya.webp", alt: "Vivek Tapaniya — CBP Participant", category: "students" },
]

const categories = [
  { id: "all", label: "All Photos" },
  { id: "highlights", label: "Event Highlights" },
  { id: "students", label: "Students & Alumni" },
  { id: "faculty", label: "Faculty & Advisers" },
]

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const filteredImages = activeTab === "all"
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeTab)

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev! + 1) % filteredImages.length)
  }, [selectedIndex, filteredImages.length])

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev! - 1 + filteredImages.length) % filteredImages.length)
  }, [selectedIndex, filteredImages.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === "Escape") setSelectedIndex(null)
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, handleNext, handlePrev])

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        {/* Banner */}
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-24 sm:py-32 relative overflow-hidden border-b border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                CBP <span className="gradient-text-cyan">Gallery</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600">
                Capturing the spirit, energy, and transformative journey of CBP
                7.0 at MNIT Jaipur through high-resolution moments and participant stories.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Gallery Content */}
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[220px]">
              {filteredImages.map((img, idx) => (
                <Reveal key={img.src + idx} delay={(idx % 6) * 60}>
                  <div
                    onClick={() => setSelectedIndex(idx)}
                    className={`group relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900 cursor-pointer transition-all duration-500 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] ${
                      img.span || ""
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100 flex flex-col justify-end p-5">
                      <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-cyan-400">
                        {img.category}
                      </span>
                      <p className="text-sm font-medium text-white mt-1 drop-shadow-[0_0_10px_#00f0ff]">
                        {img.alt}
                      </p>
                    </div>

                    {/* Quick Zoom Icon */}
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 opacity-0 transition duration-300 group-hover:opacity-100 group-hover:scale-110">
                      <FiSearch />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fadeIn">
            {/* Close Overlay Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/40 bg-black/80 text-cyan-400 text-xl font-medium transition hover:bg-cyan-500/20 hover:scale-110 z-20"
              aria-label="Close Lightbox"
            >
              <FiX />
            </button>

            {/* Previous Photo Button */}
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/40 bg-black/80 text-cyan-400 text-2xl font-medium transition hover:bg-cyan-500/20 hover:scale-110 z-20"
              aria-label="Previous Photo"
            >
              <FiChevronLeft />
            </button>

            {/* Next Photo Button */}
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/40 bg-black/80 text-cyan-400 text-2xl font-medium transition hover:bg-cyan-500/20 hover:scale-110 z-20"
              aria-label="Next Photo"
            >
              <FiChevronRight />
            </button>

            {/* Modal Image Box */}
            <div className="relative max-w-5xl w-full max-h-[80vh] flex flex-col items-center">
              <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.4)] bg-gray-950">
                <Image
                  src={filteredImages[selectedIndex].src}
                  alt={filteredImages[selectedIndex].alt}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Caption Bar */}
              <div className="mt-5 text-center bg-black/80 border border-cyan-500/30 px-6 py-3 rounded-2xl backdrop-blur-md max-w-xl w-full">
                <span className="text-xs font-sans text-cyan-400 font-medium uppercase tracking-widest">
                  Photo {selectedIndex + 1} of {filteredImages.length}
                </span>
                <p className="text-base font-medium text-white mt-1">
                  {filteredImages[selectedIndex].alt}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  )
}
