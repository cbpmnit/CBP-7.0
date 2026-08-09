"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam) {
      const tabToRouteMap: Record<string, string> = {
        students: "/admin/students",
        volunteers: "/admin/volunteers",
        sessions: "/admin/sessions",
        attendance: "/admin/attendance",
        payments: "/admin/payments",
        certificates: "/admin/certificates",
        templates: "/admin/emails",
        emails: "/admin/emails",
      }

      const targetRoute = tabToRouteMap[tabParam]
      if (targetRoute) {
        router.replace(targetRoute)
      }
    }
  }, [searchParams, router])

  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
      {/* Floating Vertical Sidebar Navigation (Single Source of Navigation) */}
      <SidebarNavigation />

      {/* Main Admin Workspace */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <AdminDashboardOverview />
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Loading Admin Dashboard...</p>
            </div>
          </div>
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </PageTransition>
  )
}
