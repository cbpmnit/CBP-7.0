const stats = [
  { value: "400+", label: "First-Year Students" },
  { value: "5", label: "Intensive Days" },
  { value: "20+", label: "Expert Speakers" },
  { value: "100%", label: "Certificate on Completion" },
]

export default function StatsSection() {
  return (
    <section className="border-y border-gray-100 bg-mnit-navy py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-mnit-gold sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
