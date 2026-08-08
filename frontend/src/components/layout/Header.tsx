"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { toggleMobileMenu, setMobileMenuOpen } from "@/store/slices/uiSlice"
import { logout } from "@/store/slices/authSlice"
import ProfileDropdown from "@/components/navbar/ProfileDropdown"
import NotificationDropdown from "@/components/navbar/NotificationDropdown"
import {
  FiMenu,
  FiX,
  FiUser,
  FiGrid,
  FiCalendar,
  FiAward,
  FiCreditCard,
  FiLogOut,
  FiBell,
} from "react-icons/fi"

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
  const { isAuthenticated, name, studentId, role } = useAppSelector((state) => state.auth)
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
  const normalizedRole = (role || "").toUpperCase()

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 py-2.5 sm:py-3 px-2 sm:px-6">
        <div
          className={`header-nav-container mx-auto max-w-7xl rounded-2xl transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg py-2 px-3.5 sm:py-2.5 sm:px-5"
              : "bg-white/90 backdrop-blur-md border border-slate-200 py-2.5 px-3.5 sm:py-3 sm:px-6 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
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
                  }}
                  aria-label="CBP 7.0 Logo"
                />
              </div>
            </Link>

            {/* Desktop Public Navigation Links */}
            <nav className="hidden items-center gap-1 lg:gap-2 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`relative flex items-center justify-center px-3 py-2 text-xs lg:text-sm transition duration-200 group ${
                      isActive
                        ? "text-cyan-700 font-bold"
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

            {/* Right Action Bar (Desktop) */}
            <div className="hidden items-center gap-3 md:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    href={
                      normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN"
                        ? "/admin/dashboard"
                        : normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER"
                        ? "/volunteer/scanner"
                        : "/dashboard"
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold tracking-wider text-slate-800 uppercase transition duration-200 hover:bg-slate-100 ${
                      pathname.startsWith("/admin") || pathname.startsWith("/volunteer") || pathname === "/dashboard"
                        ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                        : ""
                    }`}
                  >
                    <FiGrid className="h-3.5 w-3.5" />
                    <span>
                      {normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN"
                        ? "Admin Portal"
                        : normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER"
                        ? "Gate Scanner"
                        : "Dashboard"}
                    </span>
                  </Link>

                  <NotificationDropdown />

                  <ProfileDropdown
                    name={name}
                    studentId={studentId}
                    role={role}
                    onLogout={handleLogout}
                  />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-cyan-600/30 bg-cyan-50 px-4 py-2 text-xs font-bold tracking-wider text-cyan-800 uppercase transition duration-200 hover:bg-cyan-100 ${
                      pathname === "/login"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent"
                        : ""
                    }`}
                  >
                    <FiUser className="h-3.5 w-3.5" />
                    <span>LOGIN</span>
                  </Link>

                  <Link
                    href="/registration"
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2 text-xs font-bold tracking-wider uppercase shadow-sm transition"
                  >
                    REGISTER NOW
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated ? (
                <>
                  <NotificationDropdown />
                  <ProfileDropdown
                    name={name}
                    studentId={studentId}
                    role={role}
                    onLogout={handleLogout}
                  />
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-600/30 bg-cyan-50 text-cyan-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                >
                  <FiUser className="h-3.5 w-3.5" />
                  <span>LOGIN</span>
                </Link>
              )}

              <button
                onClick={handleToggleMobileMenu}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 text-xl transition duration-200"
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
        className={`fixed right-0 top-0 z-[60] h-screen w-[85vw] max-w-xs sm:w-80 bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 px-5 sm:px-6 bg-slate-50">
          <span className="text-base sm:text-lg font-bold gradient-text-cyan tracking-wider">CBP PORTAL</span>
          <button
            onClick={handleCloseMobileMenu}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 text-xl transition hover:bg-slate-100"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex flex-col py-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={handleCloseMobileMenu}
                className={`flex items-center justify-between border-b border-slate-100 px-5 py-3 text-sm transition duration-200 ${
                  isActive
                    ? "bg-cyan-50 text-cyan-800 font-bold border-l-4 border-l-cyan-600 pl-7"
                    : "text-slate-700 hover:bg-slate-50 hover:text-cyan-700"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            )
          })}

          <div className="mt-4 px-5 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN" ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      <FiGrid /> Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/students"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiUser /> Students
                    </Link>
                    <Link
                      href="/admin/attendance"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiCalendar /> Attendance
                    </Link>
                    <Link
                      href="/admin/volunteers"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiUser /> Volunteers
                    </Link>
                    <Link
                      href="/admin/notifications"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiBell /> Email Templates
                    </Link>
                  </>
                ) : normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER" ? (
                  <Link
                    href="/volunteer/scanner"
                    onClick={handleCloseMobileMenu}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    <FiCalendar /> Gate QR Scanner
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      <FiGrid /> Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiUser /> My Profile
                    </Link>
                    <Link
                      href="/attendance"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiCalendar /> Attendance
                    </Link>
                    <Link
                      href="/certificate"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiAward /> Certificates
                    </Link>
                    <Link
                      href="/payment"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      <FiCreditCard /> Payments
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider mt-2"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleCloseMobileMenu}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-cyan-600/30 bg-cyan-50 text-cyan-800 text-center px-4 py-3 text-xs font-bold uppercase tracking-wider"
                >
                  <FiUser className="h-4 w-4" />
                  <span>LOGIN</span>
                </Link>
                <Link
                  href="/registration"
                  onClick={handleCloseMobileMenu}
                  className="block w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  REGISTER NOW
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
