import Reveal from "@/components/animations/RevealOnScroll"

const stats = [
  { value: "1000+", label: "First-Year Students" },
  { value: "5", label: "Intensive Days" },
  { value: "30+", label: "Expert Speakers" },
]

export default function StatsSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 backdrop-blur-md relative z-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat, idx) => (
            <Reveal
              key={stat.label}
              variant="scale"
              delay={idx * 100}
            >
              <div className="glass-card glass-card-hover rounded-2xl p-8 text-center">
                <p className="text-4xl font-semibold gradient-text-cyan sm:text-5xl drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm font-medium uppercase tracking-wider text-gray-400">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
