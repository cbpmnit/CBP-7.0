"use client"

import { useState } from "react"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUser,
  FiMail,
  FiHelpCircle,
  FiMessageSquare,
  FiSend,
  FiMapPin,
  FiPhone,
  FiCheckCircle,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
} from "react-icons/fi"
import { HiOutlineAcademicCap } from "react-icons/hi2"
import { FaWhatsapp } from "react-icons/fa"

const contactInfo = [
  {
    title: "Department",
    value: "Dept. of Humanities & Social Sciences",
    sub: "MNIT Jaipur",
    icon: <HiOutlineAcademicCap className="h-6 w-6 text-cyan-600" />,
  },
  {
    title: "Address",
    value: "JLN Marg, Jaipur",
    sub: "Rajasthan - 302017",
    icon: <FiMapPin className="h-6 w-6 text-cyan-600" />,
  },
  {
    title: "Email",
    value: "cbpmnit@gmail.com",
    sub: "We respond within 24 hours",
    icon: <FiMail className="h-6 w-6 text-cyan-600" />,
    href: "mailto:cbpmnit@gmail.com",
  },
  {
    title: "Phone",
    value: "+91 6350 676296",
    sub: "Mon - Fri, 10:00 AM - 5:00 PM",
    icon: <FiPhone className="h-6 w-6 text-cyan-600" />,
    href: "tel:+916350676296",
  },
  {
    title: "Instagram",
    value: "@cbpmnit",
    sub: "Follow us for updates",
    icon: <FiInstagram className="h-6 w-6 text-cyan-600" />,
    href: "https://instagram.com/cbpmnit",
  },
  {
    title: "YouTube",
    value: "@cbpmnit",
    sub: "Watch past sessions",
    icon: <FiYoutube className="h-6 w-6 text-cyan-600" />,
    href: "https://youtube.com/@cbpmnit",
  },
  {
    title: "LinkedIn",
    value: "CBP MNIT",
    sub: "Connect professionally",
    icon: <FiLinkedin className="h-6 w-6 text-cyan-600" />,
    href: "https://linkedin.com/company/cbpmnit",
  },
  {
    title: "WhatsApp",
    value: "Channel",
    sub: "Join for quick updates",
    icon: <FaWhatsapp className="h-6 w-6 text-cyan-600" />,
    href: "https://whatsapp.com/channel/0029VbAx31s3QxS1vLfQCw3N",
  },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
        {/* Banner */}
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-20 sm:py-28 relative overflow-hidden border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center relative z-10">
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Get in <span className="gradient-text-cyan">Touch</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-3.5 max-w-2xl mx-auto text-base text-slate-600 leading-relaxed">
                Have questions about CBP 7.0? We are here to help. Reach out to
                our organizing team for any queries or assistance.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Contact Info Cards */}
              <div className="text-center mb-12">
                <Reveal>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Contact <span className="gradient-text-cyan">Information</span>
                  </h2>
                </Reveal>
                <Reveal delay={80}>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-2xl mx-auto">
                    Reach out to us for any queries regarding CBP 7.0 — whether
                    it is about registration, the program schedule, or general
                    information, we are happy to assist you.
                  </p>
                </Reveal>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {contactInfo.map((item, i) => {
                  const CardContent = (
                    <div className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4 items-center bg-white border border-slate-200 shadow-sm transition duration-300 h-full">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-sm">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-cyan-800 uppercase tracking-widest font-mono">
                          {item.title}
                        </p>
                        <p className="text-sm font-extrabold text-slate-900 truncate">
                          {item.value}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  )

                  return (
                    <Reveal key={item.title} delay={120 + i * 60}>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={
                            item.href.startsWith("http") ? "_blank" : "_self"
                          }
                          rel={
                            item.href.startsWith("http")
                              ? "noopener noreferrer"
                              : ""
                          }
                          className="block h-full"
                        >
                          {CardContent}
                        </a>
                      ) : (
                        <div className="h-full">{CardContent}</div>
                      )}
                    </Reveal>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
