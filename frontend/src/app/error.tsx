"use client"

import { useEffect } from "react"
import Link from "next/link"
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <main className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-cbp-grid text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 text-3xl mb-4">
          <FiAlertTriangle />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          An unexpected error occurred while processing this page. You can try refreshing or returning home.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
          >
            <FiRefreshCw /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
          >
            <FiHome /> Home
          </Link>
        </div>
      </div>
    </main>
  )
}
