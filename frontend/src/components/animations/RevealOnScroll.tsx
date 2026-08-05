"use client"

import { useEffect, useRef, useMemo, memo, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variant?: "up" | "left" | "right" | "scale" | "page"
}

function RevealComponent({
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

  const variantClass = useMemo(() => {
    switch (variant) {
      case "left":
        return "reveal-left"
      case "right":
        return "reveal-right"
      case "scale":
        return "reveal-scale"
      case "page":
        return "reveal-page"
      default:
        return "reveal"
    }
  }, [variant])

  return (
    <div ref={ref} className={`${variantClass} ${className}`}>
      {children}
    </div>
  )
}

const Reveal = memo(RevealComponent)
export default Reveal
