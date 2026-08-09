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
                <p className="text-[11px] text-slate-500 font-bold tracking-wider">
                  MNIT JAIPUR
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              A 5-day Soft Skills Development Program by the Department of
              Humanities &amp; Social Sciences and Training &amp; Placement Cell,
              MNIT Jaipur.
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
              <p className="font-medium text-slate-800">
                Department of Humanities &amp; Social Sciences
              </p>
              <p>MNIT Jaipur, JLN Marg, Jaipur - 302017</p>
              <div className="pt-2 space-y-1">
                <p>
                  <a
                    href="mailto:cbpmnit@gmail.com"
                    className="text-cyan-700 font-bold hover:text-cyan-800 transition"
                  >
                    cbpmnit@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="tel:+916350676296"
                    className="font-medium hover:text-cyan-700 transition"
                  >
                    +91 6350 676296
                  </a>
                </p>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="mt-5 flex items-center gap-4">
              <a
                href="https://instagram.com/cbpmnit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-600 transition"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://youtube.com/@cbpmnit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-600 transition"
                aria-label="YouTube"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} CBP 7.0 &middot; MNIT Jaipur. All
            rights reserved.
          </p>
          <p className="font-semibold text-slate-700">
            Training &amp; Placement Cell, MNIT Jaipur
          </p>
        </div>
      </div>
    </footer>
  )
}
