const features = [
  {
    title: "Student Registration",
    description:
      "Seamless online self-registration for 400+ first-year students with secure authentication, profile creation, and instant enrollment confirmation.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.25h15a1.5 1.5 0 001.5-1.5V18a5.25 5.25 0 00-10.5 0v.75a1.5 1.5 0 01-1.5 1.5H4.5z" />
      </svg>
    ),
  },
  {
    title: "Secure Fee Payments",
    description:
      "Integrated payment gateway supporting multiple methods with real-time confirmation, automatic receipt generation, and transparent payment history.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3 2.25h3m-9.75 3h13.5a2.25 2.25 0 002.25-2.25V6.375a2.25 2.25 0 00-2.25-2.25H3.375A2.25 2.25 0 001.125 6.375v10.5a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Attendance Tracking",
    description:
      "Real-time attendance monitoring across all sessions with both QR code and manual verification. Auto-absent marking and instant attendance reports for organizers.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Communication Hub",
    description:
      "Centralized announcements, session reminders, and targeted notifications delivered directly to students — no missed updates, ever.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.012z" />
      </svg>
    ),
  },
  {
    title: "Smart Certificates",
    description:
      "Automated personalized certificate creation with unique QR codes for instant verification. Download instantly upon meeting all program completion criteria.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 01-3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.001 6.001 0 007.73 9.728M5.25 4.236V4.5m0 0h12M5.25 4.236v3.375m0 0h12M5.25 4.236v3.375m0 0A6.001 6.001 0 0018 6.372c.962-.203 1.934-.377 2.916-.52M18 6.372v3.375m0 0h3.375" />
      </svg>
    ),
  },
  {
    title: "Admin Dashboard",
    description:
      "Comprehensive admin panel with role-based access controls, full student management, session scheduling, and complete program analytics at your fingertips.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 15.375v-2.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-mnit-light py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-mnit-accent uppercase tracking-wider">
            Platform Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-mnit-navy sm:text-4xl">
            Everything You Need, One Platform
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The CBP 7.0 platform is a centralized event management system
            designed specifically to manage the entire lifecycle of the Capacity
            Building Program at MNIT Jaipur — from sign-up to certification.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:shadow-md hover:border-mnit-blue/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mnit-blue/10 text-mnit-blue transition duration-300 group-hover:bg-mnit-blue group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-base font-bold text-mnit-navy">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
