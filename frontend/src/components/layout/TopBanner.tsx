"use client"

import Image from "next/image"
import { memo } from "react"

function TopBannerComponent() {
  return (
    <div className="top-banner-container w-full bg-black/95 text-white border-b border-cyan-500/30 relative z-50 overflow-hidden backdrop-blur-xl transition-colors duration-300">
      {/* Radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-cyan-500/10 blur-[80px] pointer-events-none" />

      {/* Top Banner Main Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 flex items-center justify-between gap-2 sm:gap-4 md:gap-6 relative z-10">
        
        {/* Left Logo Container */}
        <div className="shrink-0">
          <div className="top-banner-logo-bg relative w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-black/80 rounded-full border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full relative animate-direct-flip rounded-full overflow-hidden p-1">
              <Image
                src="/favicon/cbp-primary-logo-icon-navy-background-bg-removed.webp"
                alt="CBP Logo Left"
                fill
                className="object-contain rounded-full drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 64px, 80px"
              />
            </div>
          </div>
        </div>

        {/* Center Title & Institution Info */}
        <div className="flex-1 text-center min-w-0 px-1 sm:px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 sm:px-3 py-0.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]" />
            <span className="text-[8px] xs:text-[9px] md:text-xs font-sans font-medium tracking-widest text-cyan-300 uppercase">
              CBP 7.0 &middot; 2026 EDITION
            </span>
          </div>

          <h1 className="top-banner-title mt-0.5 sm:mt-1 text-sm xs:text-base sm:text-2xl md:text-3xl font-semibold tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.3)] truncate">
            Capacity Building Program
          </h1>

          <p className="top-banner-subtitle text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-medium text-cyan-400/90 mt-0.5 uppercase tracking-wider font-sans truncate">
            Malaviya National Institute of Technology Jaipur
          </p>
        </div>

        {/* Right Logo Container */}
        <div className="shrink-0">
          <div className="top-banner-logo-bg relative w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-black/80 rounded-full border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full relative animate-direct-flip rounded-full overflow-hidden p-1">
              <Image
                src="/favicon/cbp-primary-full-logo-navy-background.webp"
                alt="CBP Logo Right"
                fill
                className="object-contain rounded-full drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 64px, 80px"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Announcements Marquee Ticker */}
      <div className="top-banner-ticker-bg w-full bg-cyan-950/60 text-white flex items-center border-t border-cyan-500/20 h-7 sm:h-8 md:h-9 overflow-hidden text-[9px] xs:text-[10px] md:text-xs transition-colors duration-300">
        <div className="top-banner-ticker-badge bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-semibold px-2.5 sm:px-3 md:px-4 py-1.5 uppercase h-full flex items-center tracking-wider shrink-0 z-10 shadow-[4px_0_15px_rgba(0,240,255,0.4)]">
          Announcements
        </div>
        <div className="relative w-full overflow-hidden h-full flex items-center">
          <div className="top-banner-ticker-text animate-marquee hover:pause whitespace-nowrap pl-4 text-gray-200 font-sans text-xs tracking-wide">
            <span className="text-cyan-300 font-semibold">💥 Welcome to CBP 7.0 Capacity Building Program!</span> Registration deadline is approaching fast on 31 August at 6:00 PM. &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            <span className="text-cyan-300 font-semibold">🎓 Empowering first-year MNIT Jaipur students</span> with key soft skills, leadership, and emotional intelligence. &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            <span className="text-cyan-300 font-bold">💡 Industry ready workshops</span> led by distinguished academics and placement experts. &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            <span className="text-cyan-300 font-semibold">📝 Register early</span> to secure your certificate and placement resources. &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          </div>
        </div>
      </div>
    </div>
  )
}

const TopBanner = memo(TopBannerComponent)
export default TopBanner
