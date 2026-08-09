import { designTokens } from "./designTokens"

/**
 * CBP 7.0 Theme Class Mapping Helpers
 * Standardized Tailwind utility combinations matching MNIT institutional style.
 */
export const themeClasses = {
  // Container & Card primitives
  card: "bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200",
  cardSubtle: "bg-slate-50/70 border border-slate-200 rounded-xl",
  cardInteractive: "bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-cyan-500/50 hover:shadow-md transition-all duration-200 cursor-pointer",
  
  // Section Headers
  sectionHeader: "flex items-center justify-between pb-3 mb-4 border-b border-slate-100",
  sectionTitle: "text-xs font-bold uppercase tracking-wider text-slate-700",
  sectionSubtitle: "text-xs text-slate-500 mt-0.5",
  
  // Page Title
  pageTitle: "text-2xl font-extrabold text-slate-900 tracking-tight",
  pageSubtitle: "text-xs text-slate-600 mt-1",

  // Metric Number
  metricValue: "text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono",
  metricLabel: "text-[11px] font-bold uppercase tracking-wider text-slate-500",
  metricDescription: "text-[11px] font-medium text-slate-500 mt-1",

  // Button Variants
  button: {
    primary: "px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition inline-flex items-center justify-center gap-1.5 shadow-xs",
    secondary: "px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center justify-center gap-1.5",
    ghost: "p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition inline-flex items-center justify-center",
    danger: "px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition inline-flex items-center justify-center gap-1.5",
  },

  // Badge Status Variants
  badge: {
    success: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200",
    error: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200",
    info: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200",
    purple: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200",
    neutral: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200",
  },

  // Icon Boxes
  iconBox: {
    blue: "p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700",
    cyan: "p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700",
    emerald: "p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700",
    amber: "p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700",
    purple: "p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700",
    rose: "p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700",
    slate: "p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700",
  }
}

export { designTokens }
export default themeClasses
