"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminNotificationsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/emails")
  }, [router])

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to Email Management...</p>
      </div>
    </div>
  )
}
