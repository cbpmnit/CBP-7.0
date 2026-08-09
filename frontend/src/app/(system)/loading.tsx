export default function SystemLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 text-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent shadow-sm" />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
          Loading Content...
        </span>
      </div>
    </div>
  )
}
