"use client"

import { useEffect, useRef, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variant?: "up" | "left" | "right" | "scale" | "page"
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let timer: NodeJS.Timeout

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = setTimeout(() => {
              el.classList.add("revealed")
            }, delay)
          } else {
            clearTimeout(timer)
            el.classList.remove("revealed")
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    )

    observer.observe(el)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [delay])

  const variantClass =
    variant === "left"
      ? "reveal-left"
      : variant === "right"
        ? "reveal-right"
        : variant === "scale"
          ? "reveal-scale"
          : variant === "page"
            ? "reveal-page"
            : "reveal"

  return (
    <div ref={ref} className={`${variantClass} ${className}`}>
      {children}
    </div>
  )
}
