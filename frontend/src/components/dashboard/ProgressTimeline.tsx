"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FiCheck,
  FiLock,
  FiAlertCircle,
  FiUserCheck,
  FiCreditCard,
  FiCalendar,
  FiAward,
  FiArrowRight,
} from "react-icons/fi"

export interface ProgressTimelineProps {
  isProfileComplete?: boolean
  isRegistered?: boolean
  isPaymentSuccess?: boolean
  attendancePercentage?: number
  isCertificateIssued?: boolean
  registrationFee?: number
}

export type StepState = "COMPLETED" | "CURRENT" | "LOCKED"

export interface MilestoneItem {
  id: string
  stepNum: number
  title: string
  state: StepState
  statusText: string
  route: string
  requirementMsg: string
}

export default function ProgressTimeline({
  isProfileComplete = false,
  isRegistered = false,
  isPaymentSuccess = false,
  attendancePercentage = 0,
  isCertificateIssued = false,
  registrationFee = 100,
}: ProgressTimelineProps) {
  const router = useRouter()
  const [lockedNotice, setLockedNotice] = useState<string | null>(null)

  // 1. 4-Step Milestone Setup (Green=Completed, Orange=Current Action Required, Gray=Locked)
  const milestones: MilestoneItem[] = [
    {
      id: "registration",
      stepNum: 1,
      title: "Registration",
      state: !isProfileComplete || !isRegistered ? "CURRENT" : "COMPLETED",
      statusText: !isProfileComplete || !isRegistered ? "Action Required" : "Completed ✓",
      route: !isProfileComplete ? "/profile" : "/cbp",
      requirementMsg: "Complete student profile and CBP 7.0 workshop registration.",
    },
    {
      id: "payment",
      stepNum: 2,
      title: "Payment",
      state: !isRegistered
        ? "LOCKED"
        : isPaymentSuccess
        ? "COMPLETED"
        : "CURRENT",
      statusText: !isRegistered
        ? "Locked"
        : isPaymentSuccess
        ? "Paid ✓"
        : "Pending Fee",
      route: "/payment",
      requirementMsg: "Complete CBP registration before proceeding to fee payment.",
    },
    {
      id: "attendance",
      stepNum: 3,
      title: "Attendance",
      state: !isPaymentSuccess
        ? "LOCKED"
        : attendancePercentage >= 75
        ? "COMPLETED"
        : "CURRENT",
      statusText: !isPaymentSuccess
        ? "Locked"
        : attendancePercentage >= 75
        ? `${attendancePercentage.toFixed(0)}% (Passed ✓)`
        : `${attendancePercentage.toFixed(0)}% (Min 75%)`,
      route: "/attendance",
      requirementMsg: "Complete fee payment to unlock daily session attendance tracking.",
    },
    {
      id: "certificate",
      stepNum: 4,
      title: "Certificate",
      state: isCertificateIssued || (isPaymentSuccess && attendancePercentage >= 75)
        ? "COMPLETED"
        : "LOCKED",
      statusText: isCertificateIssued
        ? "Issued ✓"
        : isPaymentSuccess && attendancePercentage >= 75
        ? "Unlocked ✓"
        : "Locked",
      route: "/certificate",
      requirementMsg: "Complete workshop attendance requirement (>=75%) to unlock certificate.",
    },
  ]

  // 2. State-Based Single Next Action Card Content & Themes
  let nextAction: {
    title: string
    desc: string
    actionLabel: string
    route: string
    icon: React.ReactNode
  }

  let theme: {
    cardBg: string
    iconBg: string
    btnStyle: string
    tagStyle: string
    badgeText: string
  }

  if (!isProfileComplete) {
    nextAction = {
      title: "Complete Your Student Profile",
      desc: "Fill in personal, academic, and hostel details to start CBP enrollment.",
      actionLabel: "Complete Profile",
      route: "/profile",
      icon: <FiUserCheck />,
    }
    theme = {
      cardBg: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950",
      iconBg: "bg-amber-500 text-white",
      btnStyle: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
      tagStyle: "text-amber-800 font-bold",
      badgeText: "ACTION REQUIRED",
    }
  } else if (!isRegistered) {
    nextAction = {
      title: "Register for CBP 7.0",
      desc: "Confirm your verified student identity snapshot for workshop sessions.",
      actionLabel: "Register for CBP",
      route: "/cbp",
      icon: <FiUserCheck />,
    }
    theme = {
      cardBg: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950",
      iconBg: "bg-amber-500 text-white",
      btnStyle: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
      tagStyle: "text-amber-800 font-bold",
      badgeText: "ACTION REQUIRED",
    }
  } else if (!isPaymentSuccess) {
    nextAction = {
      title: "Complete Fee Payment",
      desc: `Pay the ₹${registrationFee} workshop fee via PhonePe to activate your attendance badge.`,
      actionLabel: "Proceed to Payment",
      route: "/payment",
      icon: <FiCreditCard />,
    }
    theme = {
      cardBg: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950",
      iconBg: "bg-amber-500 text-white",
      btnStyle: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
      tagStyle: "text-amber-800 font-bold",
      badgeText: "ACTION REQUIRED",
    }
  } else if (attendancePercentage < 75) {
    nextAction = {
      title: "View Upcoming Session",
      desc: "Track daily session attendance and present QR at auditorium gates.",
      actionLabel: "View Upcoming Session",
      route: "/attendance",
      icon: <FiCalendar />,
    }
    theme = {
      cardBg: "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 text-slate-900",
      iconBg: "bg-cyan-600 text-white",
      btnStyle: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-sm",
      tagStyle: "text-cyan-800 font-bold",
      badgeText: "NEXT ACTION",
    }
  } else {
    nextAction = {
      title: "Download Official Certificate",
      desc: "You have completed all requirements. Download your MNIT certificate.",
      actionLabel: "Download Certificate",
      route: "/certificate",
      icon: <FiAward />,
    }
    theme = {
      cardBg: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950",
      iconBg: "bg-emerald-600 text-white",
      btnStyle: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
      tagStyle: "text-emerald-800 font-bold",
      badgeText: "CERTIFICATE READY",
    }
  }

  const handleMilestoneClick = (item: MilestoneItem) => {
    setLockedNotice(null)
    if (item.state === "LOCKED") {
      setLockedNotice(item.requirementMsg)
      return
    }
    router.push(item.route)
  }

  return (
    <div className="space-y-6 mb-6">
      {/* 4-Step Progress Roadmap Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Progress Roadmap
          </h3>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            {milestones.filter((m) => m.state === "COMPLETED").length} of 4 Steps Completed
          </span>
        </div>

        {/* Scrollable Container on Mobile, Clean Grid on Desktop */}
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <div className="relative pt-2 pb-1 min-w-[480px] sm:min-w-0">
            {/* Desktop Horizontal Connecting Line - Centered vertically at y=26px behind 36px circles */}
            <div className="hidden sm:block absolute top-[26px] -translate-y-1/2 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 z-0 pointer-events-none" />

            {/* 4 Equal Column Timeline Nodes */}
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {milestones.map((item) => {
                const isCompleted = item.state === "COMPLETED"
                const isCurrent = item.state === "CURRENT"
                const isLocked = item.state === "LOCKED"

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMilestoneClick(item)}
                    className={`flex flex-col items-center gap-2 text-center group focus:outline-none ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {/* Status Circle Icon (36px x 36px) */}
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-transform group-hover:scale-105 ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-sm"
                          : isCurrent
                          ? "bg-amber-500 text-white ring-4 ring-amber-500/20 shadow-sm"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <FiCheck className="text-sm stroke-[3]" />
                      ) : isLocked ? (
                        <FiLock className="text-xs" />
                      ) : (
                        item.stepNum
                      )}
                    </div>

                    {/* Title & Status Subtext */}
                    <div className="w-full px-1">
                      <h4
                        className={`text-xs font-extrabold truncate ${
                          isCompleted
                            ? "text-slate-900"
                            : isCurrent
                            ? "text-amber-900"
                            : "text-slate-500"
                        }`}
                      >
                        {item.title}
                      </h4>

                      <span
                        className={`text-[11px] font-semibold block truncate mt-0.5 ${
                          isCompleted
                            ? "text-emerald-700 font-bold"
                            : isCurrent
                            ? "text-amber-700 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {item.statusText}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Locked Notice Alert */}
        {lockedNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-amber-600 shrink-0 text-base" />
              <span>{lockedNotice}</span>
            </div>
            <button
              onClick={() => setLockedNotice(null)}
              className="text-amber-800 font-bold text-xs hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* SINGLE MINIMAL NEXT ACTION BANNER */}
      <div
        className={`rounded-2xl p-5 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${theme.cardBg}`}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm ${theme.iconBg}`}
          >
            {nextAction.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${theme.tagStyle}`}>
              {theme.badgeText}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 break-words">{nextAction.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 break-words whitespace-normal">{nextAction.desc}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push(nextAction.route)}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 ${theme.btnStyle}`}
        >
          <span>{nextAction.actionLabel}</span>
          <FiArrowRight />
        </button>
      </div>
    </div>
  )
}
