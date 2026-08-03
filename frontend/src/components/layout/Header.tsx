"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Schedule", path: "/schedule" },
    { name: "Speakers", path: "/speakers" },
    { name: "Gallery", path: "/gallery" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-mnit-navy/95 backdrop-blur-md shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)]"
            : "bg-mnit-navy/90 backdrop-blur-sm shadow-[0_4px_20px_-5px_rgba(0,0,0,0.2)]"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-8 w-28 sm:h-10 sm:w-32 md:h-12 md:w-40 shrink-0 transition group-hover:scale-105 duration-200">
              <Image
                src="/favicon/logo-landscape.webp"
                alt="CBP Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-200 transition duration-200 hover:text-mnit-gold hover:bg-white/10"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/registration"
              className="ml-3 rounded-xl bg-mnit-gold px-5 py-2 text-sm font-bold text-mnit-navy transition duration-200 hover:bg-white hover:shadow-lg"
            >
              Register
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/registration"
              className="rounded-xl bg-mnit-gold px-3.5 py-2 text-xs font-bold text-mnit-navy transition duration-200 hover:bg-white"
            >
              Register
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-mnit-gold/30 bg-mnit-blue/50 transition duration-200 hover:bg-mnit-blue text-white"
              aria-label="Open menu"
            >
              <span className="h-0.5 w-5 bg-white transition-transform" />
              <span className="h-0.5 w-5 bg-white" />
              <span className="h-0.5 w-5 bg-white" />
            </button>
          </div>
        </div>
      </header>

      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[60] h-screen w-72 bg-mnit-navy border-l border-mnit-gold/25 shadow-2xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-mnit-gold/20 px-5 bg-mnit-blue/25">
          <span className="text-lg font-bold text-mnit-gold">Menu</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-mnit-gold/30 bg-mnit-blue/50 text-white transition hover:bg-mnit-blue"
            aria-label="Close menu"
          >
            <span className="absolute h-0.5 w-4 rotate-45 bg-white" />
            <span className="absolute h-0.5 w-4 -rotate-45 bg-white" />
          </button>
        </div>
        <nav className="flex flex-col py-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-mnit-gold/10 px-6 py-4 text-base font-semibold text-gray-200 transition duration-200 hover:bg-white/5 hover:text-mnit-gold"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-4 px-6">
            <Link
              href="/registration"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-xl bg-mnit-gold text-center px-4 py-3 text-sm font-bold text-mnit-navy transition duration-200 hover:bg-white"
            >
              Register Now
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}
