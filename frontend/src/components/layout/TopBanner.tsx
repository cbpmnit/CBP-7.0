"use client"

import Image from "next/image"

export default function TopBanner() {
  return (
    <div className="w-full bg-mnit-navy text-white shadow-lg relative z-50 animate-fadeIn">
      {/* Top Banner Content - Redesigned to be highly responsive and compact */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-6">
        
        {/* Left Logo (Horizontal Rotation) */}
        <div className="shrink-0">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-mnit-navy rounded-full shadow-lg border border-mnit-gold/50 overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full relative animate-direct-flip rounded-full overflow-hidden">
              <Image
                src="/favicon/cbp-primary-logo-icon-navy-background-bg-removed.webp"
                alt="CBP Logo Left"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>
        </div>

        {/* Center Intro Text */}
        <div className="flex-1 text-center min-w-0 px-2">
          <span className="inline-block text-[8px] md:text-xs font-bold tracking-widest text-mnit-gold uppercase bg-mnit-blue/50 px-2 md:px-3 py-0.5 rounded-full border border-mnit-gold/30 truncate max-w-full">
            Capacity Building Program 2026
          </span>
          <h1 className="mt-0.5 md:mt-1 text-lg sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-serif">
            CBP 7.0
          </h1>
          <p className="hidden md:block mt-1 text-xs md:text-sm font-semibold text-gray-300 tracking-wide">
            Department of Humanities &amp; Social Sciences &amp; Training &amp; Placement Cell
          </p>
          <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-mnit-gold/95 mt-0.5 uppercase tracking-wider">
            Malaviya National Institute of Technology Jaipur
          </p>
        </div>

        {/* Right Logo (Horizontal Rotation) */}
        <div className="shrink-0">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-mnit-navy rounded-full shadow-lg border border-mnit-gold/50 overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full relative animate-direct-flip rounded-full overflow-hidden">
              <Image
                src="/favicon/cbp-primary-full-logo-navy-background.webp"
                alt="CBP Logo Right"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>
        </div>

      </div>

      {/* Marquee Notifications Ticker */}
      <div className="w-full bg-mnit-blue text-white flex items-center border-t border-mnit-gold/20 h-8 md:h-9 overflow-hidden text-[10px] md:text-xs">
        <div className="bg-mnit-gold text-mnit-navy font-black px-3 md:px-4 py-2 uppercase h-full flex items-center tracking-wider shrink-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
          Announcements
        </div>
        <div className="relative w-full overflow-hidden h-full flex items-center">
          <div className="animate-marquee hover:pause whitespace-nowrap pl-4 text-gray-200 font-medium tracking-wide">
            💥 Welcome to CBP 7.0 capacity building program! Registration deadline is approaching fast on 31 August at 6:00 PM. &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            🎓 Empowering first-year MNIT Jaipur students with key soft skills, leadership, and emotional intelligence. &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            💡 Industry ready workshops led by distinguished academics and placement experts. &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            📝 Register early to secure your certificate and placement resources. &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          </div>
        </div>
      </div>
    </div>
  )
}
