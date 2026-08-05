import Link from "next/link"

const footerLinks = {
  Program: [
    { name: "About", href: "/about" },
    { name: "Schedule", href: "/schedule" },
    { name: "Speakers", href: "/speakers" },
    { name: "Gallery", href: "/gallery" },
  ],
  QuickLinks: [
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
    { name: "Register", href: "/registration" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 relative overflow-hidden">
      {/* Background Radial Ambient Light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                CBP
              </div>
              <div>
                <p className="text-lg font-extrabold gradient-text-cyan">CBP 7.0</p>
                <p className="text-xs text-gray-400 font-bold tracking-wider">MNIT JAIPUR</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              A comprehensive 5-day Soft Skills Development Program by the
              Department of Humanities &amp; Social Sciences in collaboration
              with the Training &amp; Placement Cell, MNIT Jaipur.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                {section}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition duration-300 hover:text-cyan-400 hover:pl-1 flex items-center gap-1.5"
                    >
                      <span className="text-cyan-500/50 text-xs">›</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Contact Us
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-400">
              <p>
                Department of Humanities &amp;{" "}
                <br className="hidden sm:block" />
                Social Sciences
              </p>
              <p>MNIT Jaipur, Jawaharlal Nehru Marg</p>
              <p>Jaipur, Rajasthan - 302017</p>
              <p className="text-cyan-400 font-semibold shadow-[0_0_8px_rgba(0,240,255,0.3)] inline-block">
                cbp@mnit.ac.in
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} CBP 7.0 &middot; MNIT Jaipur.
              All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                Training &amp; Placement Cell, MNIT Jaipur
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
