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
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
              {/* Left Column: Contact Info Cards */}
              <div>
                <Reveal>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Contact <span className="gradient-text-cyan">Information</span>
                  </h2>
                </Reveal>
                <Reveal delay={80}>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Reach out to us for any queries regarding CBP 7.0 — whether
                    it is about registration, the program schedule, or general
                    information, we are happy to assist you.
                  </p>
                </Reveal>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {contactInfo.map((item, i) => {
                    const CardContent = (
                      <div className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4 items-center bg-white border border-slate-200 shadow-sm transition duration-300 h-full">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-sm">
                          {item.icon}
                        </div>
                        <div>
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

              {/* Right Column: Clean Form UI */}
              <Reveal delay={100} variant="right">
                <div className="glass-card rounded-3xl p-8 sm:p-10 border-slate-200 bg-white shadow-xl">
                  {submitted ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-300 text-cyan-600 shadow-md">
                        <FiCheckCircle className="h-9 w-9" />
                      </div>
                      <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
                        Message Sent{" "}
                        <span className="gradient-text-cyan">Successfully!</span>
                      </h3>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                        Thank you for reaching out,{" "}
                        <strong className="text-slate-900">
                          {formData.name}
                        </strong>
                        . Our team will review your message and respond to{" "}
                        <strong className="text-cyan-700">
                          {formData.email}
                        </strong>{" "}
                        within 24 hours.
                      </p>
                      <button
                        onClick={() => {
                          setSubmitted(false)
                          setFormData({
                            name: "",
                            email: "",
                            subject: "General Inquiry",
                            message: "",
                          })
                        }}
                        className="mt-8 inline-flex items-center justify-center rounded-xl neon-button-cyan px-7 py-3 text-xs font-bold uppercase tracking-wider"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-200">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-base font-extrabold shadow-md">
                          <FiSend className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">
                            Send us a Message
                          </h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            We usually get back to you within 24 hours.
                          </p>
                        </div>
                      </div>

                      <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            <FiUser className="text-cyan-600" />
                            Your Name <span className="text-cyan-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Rahul Sharma"
                            className="block w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 shadow-xs"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            <FiMail className="text-cyan-600" />
                            Your Email <span className="text-cyan-600">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@mnit.ac.in"
                            className="block w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 shadow-xs"
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            <FiHelpCircle className="text-cyan-600" />
                            Subject <span className="text-cyan-600">*</span>
                          </label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="block w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm text-slate-900 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 shadow-xs cursor-pointer"
                          >
                            <option>General Inquiry</option>
                            <option>Registration Help</option>
                            <option>Technical Support</option>
                            <option>Feedback</option>
                            <option>Speaker / Volunteer Inquiry</option>
                          </select>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            <FiMessageSquare className="text-cyan-600" />
                            Message <span className="text-cyan-600">*</span>
                          </label>
                          <textarea
                            name="message"
                            rows={4}
                            required
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Type your query or message here..."
                            className="block w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 shadow-xs"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl neon-button-cyan py-3.5 text-sm font-bold uppercase tracking-wider shadow-md"
                        >
                          <span>Send Message</span>
                          <FiSend className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
