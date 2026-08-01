"use client"

import Link from "next/link"
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mnit-blue text-white font-bold text-sm transition group-hover:bg-mnit-navy">
              CBP
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-mnit-navy tracking-tight">
                CBP 7.0
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-gray-500 tracking-wider uppercase">
                MNIT Jaipur
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition duration-200 hover:text-mnit-blue hover:bg-mnit-light"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/registration"
              className="ml-3 rounded-xl bg-mnit-blue px-5 py-2 text-sm font-bold text-white transition duration-200 hover:bg-mnit-navy hover:shadow-lg"
            >
              Register
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/registration"
              className="rounded-xl bg-mnit-blue px-3.5 py-2 text-xs font-bold text-white transition duration-200 hover:bg-mnit-navy"
            >
              Register
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white transition duration-200 hover:bg-gray-50"
              aria-label="Open menu"
            >
              <span className="h-0.5 w-5 bg-gray-900 transition-transform" />
              <span className="h-0.5 w-5 bg-gray-900" />
              <span className="h-0.5 w-5 bg-gray-900" />
            </button>
          </div>
        </div>
      </header>

      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[60] h-screen w-72 bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5 bg-mnit-light">
          <span className="text-lg font-bold text-mnit-blue">Menu</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50"
            aria-label="Close menu"
          >
            <span className="absolute h-0.5 w-4 rotate-45 bg-gray-900" />
            <span className="absolute h-0.5 w-4 -rotate-45 bg-gray-900" />
          </button>
        </div>
        <nav className="flex flex-col py-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-gray-50 px-6 py-4 text-base font-medium text-gray-700 transition duration-200 hover:bg-mnit-light hover:text-mnit-blue"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-3 px-6">
            <Link
              href="/registration"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-xl bg-mnit-blue text-center px-4 py-3 text-sm font-bold text-white transition duration-200 hover:bg-mnit-navy"
            >
              Register Now
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}
