import SidebarNavigation from "@/components/dashboard/SidebarNavigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] w-full text-slate-900 relative">
      <SidebarNavigation />
      <main className="flex-1 min-w-0 pl-16 sm:pl-20 md:pl-24">
        {children}
      </main>
    </div>
  )
}
