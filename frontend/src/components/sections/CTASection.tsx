import Link from "next/link"

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-mnit-blue py-24 sm:py-28">
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <svg className="h-8 w-8 text-mnit-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.818a59.906 59.906 0 0110.402 4.768 50.636 50.636 0 00-2.658.813M12 10.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25-2.625a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Build Your Future?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-gray-300 sm:text-lg">
            Join CBP 7.0 and take the first step toward becoming a confident,
            skilled, and industry-ready professional. Registration is now open
            for all first-year students at MNIT Jaipur.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/registration"
              className="inline-flex items-center justify-center rounded-xl bg-mnit-gold px-8 py-3.5 text-sm font-bold text-mnit-navy transition duration-200 hover:bg-white hover:shadow-xl"
            >
              Register for CBP 7.0
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
