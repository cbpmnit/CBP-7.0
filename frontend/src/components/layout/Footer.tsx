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
    <footer className="bg-mnit-navy text-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mnit-gold text-mnit-navy font-bold text-sm">
                CBP
              </div>
              <div>
                <p className="text-base font-bold text-white">CBP 7.0</p>
                <p className="text-xs text-gray-400">MNIT Jaipur</p>
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
              <h3 className="text-sm font-semibold uppercase tracking-wider text-mnit-gold">
                {section}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition duration-200 hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-mnit-gold">
              Contact
            </h3>
            <div className="mt-4 space-y-2.5 text-sm text-gray-400">
              <p>
                Department of Humanities &amp;{" "}
                <br className="hidden sm:block" />
                Social Sciences
              </p>
              <p>MNIT Jaipur, Jawaharlal Nehru Marg</p>
              <p>Jaipur, Rajasthan - 302017</p>
              <p className="text-mnit-gold font-medium">cbp@mnit.ac.in</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} CBP 7.0 &middot; MNIT Jaipur.
              All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Managed by Training &amp; Placement Cell
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
