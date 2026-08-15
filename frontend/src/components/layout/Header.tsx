"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { toggleMobileMenu, setMobileMenuOpen } from "@/store/slices/uiSlice"
import { logout } from "@/store/slices/authSlice"
import ProfileDropdown from "./ProfileDropdown"
import NotificationDropdown from "./NotificationDropdown"
import { getAccessibleModules, renderModuleIcon } from "@/config/adminModules"
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
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("cbp-permissions")
        setUserPermissions(raw ? JSON.parse(raw) : [])
      } catch {
        setUserPermissions([])
      }
    }
  }, [])

  const accessibleModules = useMemo(
    () => getAccessibleModules(role || "", userPermissions),
    [role, userPermissions]
  )

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
              <div className="relative h-8 w-28 sm:h-11 sm:w-44 shrink-0 transition duration-300 group-hover:scale-105">
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
                        ? "/volunteer/dashboard"
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
                      ? "ADMIN PORTAL"
                      : normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER"
                      ? "VOLUNTEER DASHBOARD"
                      : "STUDENT DASHBOARD"}
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
                    href="/register"
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2 text-xs font-bold tracking-wider uppercase shadow-sm transition"
                  >
                    PUBLIC REGISTRATION
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
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  <FiAward className="h-3.5 w-3.5" />
                  <span>REGISTER</span>
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
        className={`fixed right-0 top-0 z-[60] h-screen w-[85vw] max-w-sm bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-out md:hidden flex flex-col justify-between ${
          isMenuOpen ? "translate-x-0 menu-open" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 px-5 bg-slate-50 shrink-0">
          <Link href="/" onClick={handleCloseMobileMenu} className="flex items-center gap-2">
            <div className="relative h-8 w-28 shrink-0">
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
          <button
            onClick={handleCloseMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 text-xl transition hover:bg-slate-100 cursor-pointer"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* SECTION 1: PUBLIC NAVIGATION */}
          <div className="px-5 pb-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Explore CBP
            </span>
          </div>
          <nav className="flex flex-col">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={handleCloseMobileMenu}
                  className={`stagger-item flex items-center justify-between border-b border-slate-100 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition duration-200 ${
                    isActive
                      ? "bg-cyan-50/60 text-cyan-800 border-l-4 border-l-cyan-600 pl-7"
                      : "text-slate-700 hover:bg-slate-50 hover:text-cyan-700"
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* SECTION 2: AUTHENTICATED AREA */}
          {isAuthenticated && (
            <div className="mt-6 px-5 border-t border-slate-100 pt-6 stagger-item" style={{ animationDelay: `${navLinks.length * 40}ms` }}>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Account & Workspace
              </span>

              {normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN" || normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER" ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {normalizedRole.includes("ADMIN") ? "Admin Portal" : "Volunteer Workspace"}
                      </h4>
                    </div>
                    <Link
                      href={normalizedRole.includes("ADMIN") ? "/admin/dashboard" : "/volunteer/dashboard"}
                      onClick={handleCloseMobileMenu}
                      className="block w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center uppercase tracking-wider transition shadow-sm active-press"
                    >
                      Open Dashboard
                    </Link>
                  </div>

                  {accessibleModules.length > 0 && (
                    <div className="pt-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Assigned Modules
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {accessibleModules.map((module) => {
                          const isActive = pathname === module.route
                          return (
                            <Link
                              key={module.id}
                              href={module.route}
                              onClick={handleCloseMobileMenu}
                              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                                isActive
                                  ? "bg-cyan-50 text-cyan-800 font-bold border border-cyan-200"
                                  : "text-slate-700 bg-slate-50/70 hover:bg-slate-100 border border-slate-200/60"
                              }`}
                            >
                              <span className="text-cyan-700 text-sm">
                                {renderModuleIcon(module.iconName)}
                              </span>
                              <span className="truncate">{module.title}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Student Dashboard</h4>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={handleCloseMobileMenu}
                    className="block w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center uppercase tracking-wider transition shadow-sm active-press"
                  >
                    Open Dashboard
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated ? (
          <div className="border-t border-slate-100 p-5 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-800 text-xs font-bold uppercase shrink-0">
                {name ? name.substring(0, 2) : "US"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{name || "User"}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {role ? role.replace("ROLE_", "") : "Member"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                handleCloseMobileMenu()
                handleLogout()
              }}
              className="h-9 w-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center text-base hover:bg-rose-100 transition shrink-0 cursor-pointer active-press"
              aria-label="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        ) : (
          <div className="border-t border-slate-100 p-5 bg-slate-50 flex flex-col gap-2 shrink-0">
            <Link
              href="/register"
              onClick={handleCloseMobileMenu}
              className="block w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm active-press"
            >
              REGISTER FOR CBP 7.0
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

const Header = memo(HeaderComponent)
export default Header
