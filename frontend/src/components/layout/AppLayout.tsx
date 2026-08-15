import React from "react"
import SidebarNavigation from "./SidebarNavigation"

export interface AppLayoutProps {
  children: React.ReactNode
  allowedPermissions?: string[]
}

export function AppLayout({ children, allowedPermissions }: AppLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] w-full text-slate-900 relative">
      {/* Floating Vertical Sidebar Dock (Desktop Only) */}
      <SidebarNavigation allowedPermissions={allowedPermissions} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full">
        {/* Unified Centered Content Container */}
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AppLayout
