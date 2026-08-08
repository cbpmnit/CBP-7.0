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
    <footer className="bg-white border-t border-slate-200 text-slate-600 mt-auto w-full relative z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-extrabold text-sm shadow-sm">
                CBP
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">CBP 7.0</p>
                <p className="text-[11px] text-slate-500 font-bold tracking-wider">MNIT JAIPUR</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              A 5-day Soft Skills Development Program by the Department of Humanities &amp; Social Sciences and Training &amp; Placement Cell, MNIT Jaipur.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {section}
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-600 transition hover:text-cyan-700 font-medium"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contact Us
            </h3>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Department of Humanities &amp; Social Sciences</p>
              <p>MNIT Jaipur, JLN Marg, Jaipur - 302017</p>
              <p className="text-cyan-700 font-bold">cbp@mnit.ac.in</p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} CBP 7.0 &middot; MNIT Jaipur. All rights reserved.
          </p>
          <p className="font-semibold text-slate-700">
            Training &amp; Placement Cell, MNIT Jaipur
          </p>
        </div>
      </div>
    </footer>
  )
}
