"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/utils/api"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]
const COURSES = ["BTECH", "MTECH", "MBA"]
const BRANCHES = [
  "CHEMICAL_ENGINEERING",
  "COMPUTER_SCIENCE_ENGINEERING",
  "CIVIL_ENGINEERING",
  "MECHANICAL_ENGINEERING",
  "ELECTRICAL_ENGINEERING",
  "ELECTRONICS_COMMUNICATION",
  "METALLURGICAL_ENGINEERING",
  "ARCHITECTURE",
  "ARTIFICIAL_INTELLIGENCE_DATA_SCIENCE",
  "MATERIALS_ENGINEERING",
  "MANAGEMENT_STUDIES",
  "OTHER",
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [mode, setMode] = useState<"CREATE" | "EDIT">("CREATE")
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    profilePhotoUrl: "",
    gender: "MALE",
    dateOfBirth: "",
    phoneNumber: "",
    whatsappNumber: "",
    institute: "MNIT Jaipur",
    course: "BTECH",
    branch: "COMPUTER_SCIENCE_ENGINEERING",
    year: 1,
    section: "",
    hosteller: false,
    roomNumber: "",
    city: "",
    state: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data: any = await api.get("/api/v1/profile/me")
      if (data) {
        setFormData({
          firstName: data.firstName || "",
          middleName: data.middleName || "",
          lastName: data.lastName || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
          gender: data.gender || "MALE",
          dateOfBirth: data.dateOfBirth || "",
          phoneNumber: data.phoneNumber || "",
          whatsappNumber: data.whatsappNumber || "",
          institute: data.institute || "MNIT Jaipur",
          course: data.course || "BTECH",
          branch: data.branch || "COMPUTER_SCIENCE_ENGINEERING",
          year: data.year || 1,
          section: data.section || "",
          hosteller: data.hosteller || false,
          roomNumber: data.roomNumber || "",
          city: data.city || "",
          state: data.state || "",
        })
        setMode("EDIT")
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMode("CREATE")
      } else {
        setMessage("Failed to load profile details")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? parseInt(value) || 0
        : value

    setFormData((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setErrors({})
    setMessage(null)

    try {
      if (mode === "CREATE") {
        await api.post("/api/v1/profile", formData)
        setMessage("Profile created successfully!")
        setMode("EDIT")
      } else {
        await api.put("/api/v1/profile", formData)
        setMessage("Profile updated successfully!")
      }
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorData?.errors) {
          setErrors(err.errorData.errors)
        } else {
          setMessage(err.message || "Failed to save profile")
        }
      } else {
        setMessage("An unexpected error occurred.")
      }
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Fetching Profile Data...
          </span>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber py-24 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-5 relative z-10">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                Student Profile Setup
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {mode === "CREATE" ? "Complete Your" : "Manage Your"}{" "}
                <span className="gradient-text-cyan">Profile</span>
              </h1>
              <p className="mt-2 text-base text-gray-400">
                Please ensure your details match college records for certificate validation.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {message && (
                <div
                  className={`p-4 rounded-2xl border text-sm font-semibold text-center ${
                    message.includes("success")
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                      : "bg-red-500/10 border-red-500/40 text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* SECTION 1: Personal Details */}
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <h2 className="text-xl font-extrabold text-white mb-6 border-b border-white/5 pb-2">
                  1. Personal Details
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      First Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Last Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Gender <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Date Of Birth <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-xs text-red-400">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Academic Details */}
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <h2 className="text-xl font-extrabold text-white mb-6 border-b border-white/5 pb-2">
                  2. Academic Details
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Institute <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="institute"
                      required
                      value={formData.institute}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Course / Program <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 mt-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Branch / Discipline <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Year <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="year"
                      min="1"
                      max="5"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Section <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="section"
                    required
                    value={formData.section}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g. A"
                  />
                  {errors.section && (
                    <p className="mt-1 text-xs text-red-400">{errors.section}</p>
                  )}
                </div>
              </div>

              {/* SECTION 3: Contact & Accommodation */}
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <h2 className="text-xl font-extrabold text-white mb-6 border-b border-white/5 pb-2">
                  3. Contact & Accommodation
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Phone Number <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      WhatsApp Number <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      required
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.whatsappNumber && (
                      <p className="mt-1 text-xs text-red-400">{errors.whatsappNumber}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hosteller"
                    name="hosteller"
                    checked={formData.hosteller}
                    onChange={handleChange}
                    className="h-5 w-5 rounded bg-black border-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-black"
                  />
                  <label htmlFor="hosteller" className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    Are you a Hosteller?
                  </label>
                </div>

                {formData.hosteller && (
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Room / Hostel Details <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      required
                      value={formData.roomNumber}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                      placeholder="e.g. Room 101, Hostel H-10"
                    />
                    {errors.roomNumber && (
                      <p className="mt-1 text-xs text-red-400">{errors.roomNumber}</p>
                    )}
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      City <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-400">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      State <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:outline-none"
                    />
                    {errors.state && (
                      <p className="mt-1 text-xs text-red-400">{errors.state}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full rounded-xl neon-button-cyan py-4 text-sm font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveLoading ? "Saving Details..." : "Save Profile Details"}
              </button>
            </form>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
