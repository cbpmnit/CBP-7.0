"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { toggleTheme } from "@/store/slices/themeSlice"
import { toggleMobileMenu, setMobileMenuOpen } from "@/store/slices/uiSlice"
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi"

const NAV_LINKS = [
  { name: "About", path: "/about" },
  { name: "Schedule", path: "/schedule" },
  { name: "Speakers", path: "/speakers" },
  { name: "Gallery", path: "/gallery" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
]

function HeaderComponent() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const isMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleToggleTheme = useCallback(() => {
    dispatch(toggleTheme())
  }, [dispatch])

  const handleToggleMobileMenu = useCallback(() => {
    dispatch(toggleMobileMenu())
  }, [dispatch])

  const handleCloseMobileMenu = useCallback(() => {
    dispatch(setMobileMenuOpen(false))
  }, [dispatch])

  const navLinks = useMemo(() => NAV_LINKS, [])

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-500 py-2.5 sm:py-3 px-2 sm:px-6">
        <div
          className={`header-nav-container mx-auto max-w-7xl rounded-2xl transition-all duration-300 ${
            scrolled
              ? "bg-black/85 backdrop-blur-xl border border-cyan-500/40 shadow-[0_10px_30px_-5px_rgba(0,240,255,0.25)] py-2 px-3.5 sm:py-2.5 sm:px-5"
              : "bg-black/60 backdrop-blur-md border border-white/15 py-2.5 px-3.5 sm:py-3 sm:px-6 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative h-9 w-32 sm:h-11 sm:w-44 shrink-0 transition duration-300 group-hover:scale-105">
                {/* Dark Mode Original Logo Image */}
                <Image
                  src="/favicon/logo-landscape.webp"
                  alt="CBP Logo"
                  fill
                  className="header-logo-dark object-contain drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                  priority
                  sizes="(max-width: 640px) 128px, 176px"
                />
                {/* Light Mode Gradient Masked Logo Div */}
                <div
                  className="header-logo-light h-full w-full"
                  style={{
                    WebkitMaskImage: "url(/favicon/logo-landscape.webp)",
                    maskImage: "url(/favicon/logo-landscape.webp)",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    background: "linear-gradient(180deg, #00d4ff 0%, #0284c7 50%, #1e40af 100%)",
                    filter: "drop-shadow(0 2px 8px rgba(0, 212, 255, 0.4))",
                  }}
                  aria-label="CBP 7.0 Logo"
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1.5 lg:gap-2.5 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`header-nav-link relative flex items-center justify-center rounded-xl px-4 py-2 text-sm font-normal transition duration-300 group ${
                      isActive
                        ? "header-nav-link-active bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                        : "text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent"
                    }`}
                  >
                    <span>{link.name}</span>
                    <span
                      className={`header-nav-line absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_#00f0ff] ${
                        isActive ? "w-2/3" : "w-0 group-hover:w-1/2"
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            {/* Right Action CTA & Theme Switcher */}
            <div className="hidden items-center gap-3 md:flex">
              {/* Theme Switcher Button */}
              <button
                onClick={handleToggleTheme}
                className="header-theme-btn flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-black/60 text-cyan-400 text-lg transition duration-300 hover:scale-105 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                aria-label="Toggle Light/Dark Theme"
                title={mounted ? `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode` : "Toggle Theme"}
                suppressHydrationWarning
              >
                {mounted ? (theme === "dark" ? <FiSun /> : <FiMoon />) : <FiSun />}
              </button>

              <Link
                href="/registration"
                className={`rounded-xl px-6 py-2.5 text-xs font-medium tracking-wider uppercase transition duration-300 ${
                  pathname === "/registration"
                    ? "neon-button-cyan scale-105 shadow-[0_0_30px_rgba(0,240,255,0.7)]"
                    : "neon-button-cyan shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                }`}
              >
                Register Now
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:hidden">
              <button
                onClick={handleToggleTheme}
                className="header-theme-btn flex h-8 w-8 xs:h-9 xs:w-9 items-center justify-center rounded-xl border border-cyan-500/40 bg-black/60 text-cyan-400 text-sm xs:text-base"
                aria-label="Toggle Light/Dark Theme"
                title={mounted ? `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode` : "Toggle Theme"}
                suppressHydrationWarning
              >
                {mounted ? (theme === "dark" ? <FiSun /> : <FiMoon />) : <FiSun />}
              </button>

              <Link
                href="/registration"
                className="rounded-xl neon-button-cyan px-3 py-1.5 xs:px-4 xs:py-2 text-[10px] xs:text-xs font-medium uppercase tracking-wide"
              >
                Register
              </Link>

              <button
                onClick={handleToggleMobileMenu}
                className="header-menu-btn flex h-8 w-8 xs:h-10 xs:w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-black/80 text-cyan-400 text-lg xs:text-xl transition duration-200"
                aria-label="Open menu"
              >
                <FiMenu />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        onClick={handleCloseMobileMenu}
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Mobile Drawer */}
      <aside
        className={`header-mobile-drawer fixed right-0 top-0 z-[60] h-screen w-[85vw] max-w-xs sm:w-80 bg-gray-950/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="header-drawer-title-bar flex h-16 sm:h-20 items-center justify-between border-b border-cyan-500/20 px-5 sm:px-6 bg-black/50">
          <span className="text-base sm:text-lg font-medium gradient-text-cyan tracking-wider">NAVIGATION</span>
          <button
            onClick={handleCloseMobileMenu}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-black text-cyan-400 text-lg sm:text-xl transition hover:bg-cyan-500/20"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>
        <nav className="flex flex-col py-3 sm:py-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={handleCloseMobileMenu}
                className={`flex items-center justify-between border-b border-white/5 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-normal transition duration-200 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 font-medium border-l-4 border-l-cyan-400 pl-7 sm:pl-8 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    : "text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-400 hover:pl-7 sm:hover:pl-8"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            )
          })}
          <div className="mt-6 sm:mt-8 px-5 sm:px-6">
            <Link
              href="/registration"
              onClick={handleCloseMobileMenu}
              className="block w-full rounded-xl neon-button-cyan text-center px-4 py-3.5 sm:px-5 sm:py-4 text-xs sm:text-sm font-medium uppercase tracking-wider"
            >
              Register Now
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}

const Header = memo(HeaderComponent)
export default Header
