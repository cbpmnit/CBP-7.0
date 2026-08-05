"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { toggleMobileMenu, setMobileMenuOpen } from "@/store/slices/uiSlice"
import { logout } from "@/store/slices/authSlice"
import { FiMenu, FiX, FiUser } from "react-icons/fi"

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
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [scrolled, setScrolled] = useState(false)

  const handleLogout = useCallback(() => {
    dispatch(logout())
    dispatch(setMobileMenuOpen(false))
    router.push("/login")
  }, [dispatch, router])

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
              ? "bg-white/90 backdrop-blur-xl border border-cyan-600/30 shadow-[0_10px_30px_-5px_rgba(2,132,199,0.15)] py-2 px-3.5 sm:py-2.5 sm:px-5"
              : "bg-white/75 backdrop-blur-md border border-slate-200 py-2.5 px-3.5 sm:py-3 sm:px-6 shadow-md shadow-slate-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Brand Logo - Vibrant Cyan-Blue Gradient Mask */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative h-9 w-32 sm:h-11 sm:w-44 shrink-0 transition duration-300 group-hover:scale-105">
                <div
                  className="h-full w-full"
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
                    filter: "drop-shadow(0 2px 8px rgba(0, 212, 255, 0.6))",
                  }}
                  aria-label="CBP 7.0 Logo"
                />
              </div>
            </Link>

            {/* Desktop Navigation Links - Clean Minimal Text (No Pill Box) */}
            <nav className="hidden items-center gap-1.5 lg:gap-3 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`header-nav-link relative flex items-center justify-center px-3.5 py-2 text-sm transition duration-200 group ${
                      isActive
                        ? "header-nav-link-active text-cyan-700 font-bold"
                        : "text-slate-700 hover:text-cyan-700 font-medium"
                    }`}
                  >
                    <span>{link.name}</span>
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full transition-all duration-300 ${
                        isActive ? "w-4/5 opacity-100" : "w-0 opacity-0 group-hover:w-3/5 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            {/* Right Action CTA (Login & Register Now - Desktop) */}
            <div className="hidden items-center gap-2.5 md:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-cyan-600/30 bg-cyan-50/80 px-4.5 py-2 text-xs font-bold tracking-wider text-cyan-700 uppercase transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-transparent hover:shadow-md hover:shadow-cyan-600/20 ${
                      pathname === "/dashboard"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-md shadow-cyan-600/30"
                        : ""
                    }`}
                  >
                    <FiUser className="h-3.5 w-3.5" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 neon-button-cyan shadow-md shadow-cyan-600/30 hover:shadow-cyan-600/50"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-cyan-600/30 bg-cyan-50/80 px-4.5 py-2 text-xs font-bold tracking-wider text-cyan-700 uppercase transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-transparent hover:shadow-md hover:shadow-cyan-600/20 ${
                      pathname === "/login"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-md shadow-cyan-600/30"
                        : ""
                    }`}
                  >
                    <FiUser className="h-3.5 w-3.5" />
                    <span>Login</span>
                  </Link>

                  <Link
                    href="/registration"
                    className={`rounded-xl px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                      pathname === "/registration"
                        ? "neon-button-cyan scale-105 shadow-[0_0_30px_rgba(2,132,199,0.5)]"
                        : "neon-button-cyan shadow-md shadow-cyan-600/30 hover:shadow-cyan-600/50"
                    }`}
                  >
                    Register Now
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions - ONLY LOGIN/DASHBOARD BUTTON & HAMBURGER MENU */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className={`inline-flex items-center gap-1.5 rounded-xl border border-cyan-600/30 bg-cyan-50 text-cyan-700 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  pathname === "/login" || pathname === "/dashboard"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-sm"
                    : ""
                }`}
              >
                <FiUser className="h-3.5 w-3.5" />
                <span>{isAuthenticated ? "Dashboard" : "Login"}</span>
              </Link>

              <button
                onClick={handleToggleMobileMenu}
                className="header-menu-btn flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700 text-xl transition duration-200"
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
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Mobile Drawer */}
      <aside
        className={`header-mobile-drawer fixed right-0 top-0 z-[60] h-screen w-[85vw] max-w-xs sm:w-80 bg-white/98 backdrop-blur-xl border-l border-slate-200 shadow-2xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="header-drawer-title-bar flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 px-5 sm:px-6 bg-slate-50">
          <span className="text-base sm:text-lg font-bold gradient-text-cyan tracking-wider">NAVIGATION</span>
          <button
            onClick={handleCloseMobileMenu}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700 text-xl transition hover:bg-cyan-50"
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
                className={`flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-normal transition duration-200 ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700 font-bold border-l-4 border-l-cyan-600 pl-7 sm:pl-8"
                    : "text-slate-700 hover:bg-cyan-50/50 hover:text-cyan-700 hover:pl-7 sm:hover:pl-8"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            )
          })}
          <div className="mt-6 sm:mt-8 px-5 sm:px-6 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={handleCloseMobileMenu}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-cyan-600/30 bg-cyan-50 text-cyan-700 text-center px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white transition duration-300"
                >
                  <FiUser className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-xl neon-button-cyan text-center px-4 py-3.5 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleCloseMobileMenu}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-cyan-600/30 bg-cyan-50 text-cyan-700 text-center px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white transition duration-300"
                >
                  <FiUser className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/registration"
                  onClick={handleCloseMobileMenu}
                  className="block w-full rounded-xl neon-button-cyan text-center px-4 py-3.5 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider"
                >
                  Register Now
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}

const Header = memo(HeaderComponent)
export default Header
