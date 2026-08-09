import Link from "next/link"
import { FiAlertCircle, FiArrowRight, FiHome } from "react-icons/fi"

export default function RootNotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-cbp-grid text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 text-3xl mb-4">
          <FiAlertCircle />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
          Error 404
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <FiHome /> Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
          >
            <span>Dashboard</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </main>
  )
}
