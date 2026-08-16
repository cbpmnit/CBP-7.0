"use client"

import Image from "next/image"
import { memo } from "react"

function TopBannerComponent() {
  return (
    <div className="top-banner-container w-full bg-white/95 text-slate-900 border-b border-slate-200 relative z-50 overflow-hidden backdrop-blur-xl transition-colors duration-300">
      {/* Radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-cyan-500/10 blur-[80px] pointer-events-none" />

      {/* Top Banner Main Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-6 relative z-10">
        
        {/* Left Logo Container */}
        <div className="shrink-0">
          <div className="top-banner-logo-bg relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full border border-white/40 shadow-md shadow-cyan-600/20 overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full relative rounded-full overflow-hidden p-1">
              <Image
                src="/favicon/cbp-primary-logo-icon-navy-background-bg-removed.webp"
                alt="CBP Logo Left"
                fill
                className="object-contain rounded-full drop-shadow-md"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 56px, 64px"
              />
            </div>
          </div>
        </div>

        {/* Center Title & Institution Info */}
        <div className="flex-1 text-center min-w-0 px-1 sm:px-2">
          <h1 className="top-banner-title text-sm xs:text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 truncate">
            CAPACITY BUILDING PROGRAM
          </h1>

          <p className="top-banner-subtitle text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-semibold text-cyan-700 mt-0.5 uppercase tracking-wider font-sans truncate">
            Malaviya National Institute of Technology Jaipur
          </p>
        </div>

        {/* Right Logo Container */}
        <div className="shrink-0">
          <div className="top-banner-logo-bg relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full border border-white/40 shadow-md shadow-cyan-600/20 overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full relative rounded-full overflow-hidden p-1">
              <Image
                src="/favicon/cbp-primary-full-logo-navy-background.webp"
                alt="CBP Logo Right"
                fill
                className="object-contain rounded-full drop-shadow-md"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 56px, 64px"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const TopBanner = memo(TopBannerComponent)
export default TopBanner
