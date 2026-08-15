"use client"

import React from "react"
import Spinner from "./Spinner"

export interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  inline?: boolean
  className?: string
}

export function LoadingScreen({
  message = "Loading...",
  fullScreen = true,
  inline = false,
  className = "",
}: LoadingScreenProps) {
  const containerClasses = inline
    ? "flex items-center justify-center p-4 text-slate-700"
    : fullScreen
    ? "fixed inset-0 min-h-screen bg-slate-900/90 backdrop-blur-xs z-50 flex items-center justify-center text-white"
    : "flex min-h-[300px] w-full items-center justify-center p-8 text-slate-700"

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color={fullScreen ? "cyan" : "cyan"} />
        <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
          {message}
        </span>
      </div>
    </div>
  )
}

export default LoadingScreen
