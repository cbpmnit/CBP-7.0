import SidebarNavigation from "@/components/dashboard/SidebarNavigation"

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
      <SidebarNavigation />
      {children}
    </div>
  )
}
