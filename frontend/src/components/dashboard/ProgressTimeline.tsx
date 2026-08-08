"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FiCheck,
  FiCheckCircle,
  FiLock,
  FiArrowRight,
  FiInfo,
  FiAlertCircle,
  FiExternalLink,
  FiUserCheck,
  FiCreditCard,
  FiCalendar,
  FiAward,
} from "react-icons/fi"

export type StepStatus = "COMPLETED" | "CURRENT" | "AVAILABLE" | "LOCKED"

export interface JourneyStep {
  id: string
  title: string
  status: StepStatus
  statusLabel: string
  enabled: boolean
  route: string
  requirementMsg?: string
  tooltip: string
  actionLabel?: string
  icon?: React.ReactNode
}

export interface ProgressTimelineProps {
  steps?: JourneyStep[]
  isProfileComplete?: boolean
  isRegistered?: boolean
  isPaymentSuccess?: boolean
  attendancePercentage?: number
  isCertificateIssued?: boolean
  onStepClick?: (step: JourneyStep) => void
}

export default function ProgressTimeline({
  steps: customSteps,
  isProfileComplete = false,
  isRegistered = false,
  isPaymentSuccess = false,
  attendancePercentage = 0,
  isCertificateIssued = false,
  onStepClick,
}: ProgressTimelineProps) {
  const router = useRouter()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [lockedAlert, setLockedAlert] = useState<string | null>(null)

  // 1. Build journey steps from backend state if not provided
  const steps: JourneyStep[] = customSteps || [
    {
      id: "registration",
      title: "1. Registration",
      status: !isProfileComplete
        ? "CURRENT"
        : !isRegistered
        ? "CURRENT"
        : "COMPLETED",
      statusLabel: !isProfileComplete
        ? "Profile Incomplete"
        : !isRegistered
        ? "Action Required"
        : "Completed ✓",
      enabled: true,
      route: !isProfileComplete ? "/profile" : "/cbp",
      requirementMsg: !isProfileComplete
        ? "Please complete your student profile details first before CBP registration."
        : !isRegistered
        ? "Submit your CBP 7.0 workshop registration to obtain your official registration ID."
        : "CBP 7.0 workshop registration is confirmed and verified.",
      tooltip: "CBP program enrollment and student ID registration.",
      actionLabel: !isProfileComplete ? "Complete Profile" : "Complete Registration",
      icon: <FiUserCheck />,
    },
    {
      id: "payment",
      title: "2. Fee Payment",
      status: !isRegistered
        ? "LOCKED"
        : isPaymentSuccess
        ? "COMPLETED"
        : "CURRENT",
      statusLabel: !isRegistered
        ? "Complete registration first"
        : isPaymentSuccess
        ? "Paid ✓"
        : "Pending Fee",
      enabled: isRegistered,
      route: "/payment",
      requirementMsg: !isRegistered
        ? "You must complete CBP registration before proceeding to the payment portal."
        : !isPaymentSuccess
        ? "Pay the ₹500 registration fee via PhonePe to activate your event badge."
        : "Payment verified successfully via PhonePe gateway.",
      tooltip: "₹500 PhonePe online gateway fee verification.",
      actionLabel: "Proceed to Payment",
      icon: <FiCreditCard />,
    },
    {
      id: "attendance",
      title: "3. Attendance",
      status: !isPaymentSuccess
        ? "LOCKED"
        : attendancePercentage >= 75
        ? "COMPLETED"
        : "CURRENT",
      statusLabel: !isPaymentSuccess
        ? "Complete payment first"
        : attendancePercentage >= 75
        ? `${attendancePercentage.toFixed(0)}% (Passed ✓)`
        : `${attendancePercentage.toFixed(0)}% (Min 75%)`,
      enabled: isPaymentSuccess,
      route: "/attendance",
      requirementMsg: !isPaymentSuccess
        ? "Fee payment is required before you can access daily session QR and gate scanning."
        : attendancePercentage >= 75
        ? "Attendance requirement fulfilled (75%+ threshold reached)."
        : "Attend daily workshop sessions. A minimum of 75% attendance is required for certificate eligibility.",
      tooltip: "Requires 75% workshop attendance across 5 daily sessions.",
      actionLabel: "View Attendance",
      icon: <FiCalendar />,
    },
    {
      id: "certificate",
      title: "4. Certificate",
      status: isCertificateIssued
        ? "COMPLETED"
        : isPaymentSuccess && attendancePercentage >= 75
        ? "AVAILABLE"
        : "LOCKED",
      statusLabel: isCertificateIssued
        ? "Issued ✓"
        : isPaymentSuccess && attendancePercentage >= 75
        ? "Eligible (Ready)"
        : !isPaymentSuccess
        ? "Locked"
        : "Requires 75% attendance",
      enabled: isCertificateIssued || (isPaymentSuccess && attendancePercentage >= 75),
      route: "/certificate",
      requirementMsg: !isPaymentSuccess
        ? "Registration, payment, and 75% attendance are required to unlock your certificate."
        : attendancePercentage < 75
        ? `Current attendance is ${attendancePercentage.toFixed(0)}%. You need at least 75% attendance to unlock certificate.`
        : "Official CBP 7.0 soft skills certificate is ready for download.",
      tooltip: "Official PDF credential unlocked upon meeting 75% attendance.",
      actionLabel: isCertificateIssued ? "Download Certificate" : "Claim Certificate",
      icon: <FiAward />,
    },
  ]

  // 2. Identify the active / next required primary action
  const nextActiveStep =
    steps.find((s) => s.status === "CURRENT") ||
    steps.find((s) => s.status === "AVAILABLE") ||
    steps[steps.length - 1]

  const handleStepClick = (step: JourneyStep) => {
    if (onStepClick) {
      onStepClick(step)
      return
    }

    if (step.enabled) {
      setLockedAlert(null)
      router.push(step.route)
    } else {
      setLockedAlert(
        step.requirementMsg ||
          `This step is currently locked. Please complete the preceding requirements to continue.`
      )
    }
  }

  const handlePrimaryAction = () => {
    if (nextActiveStep && nextActiveStep.enabled) {
      router.push(nextActiveStep.route)
    } else if (nextActiveStep) {
      setLockedAlert(nextActiveStep.requirementMsg || "Complete the previous requirements to proceed.")
    }
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Main Journey Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Student Onboarding Journey
            </h3>
            <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
              CBP 7.0 Progress &amp; Milestone Roadmap
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            {steps.filter((s) => s.status === "COMPLETED").length} of {steps.length} Steps Completed
          </span>
        </div>

        {/* Desktop / Tablet Horizontal Stepper & Mobile Vertical Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative">
          {steps.map((step, idx) => {
            const isCompleted = step.status === "COMPLETED"
            const isCurrent = step.status === "CURRENT"
            const isLocked = step.status === "LOCKED"

            return (
              <div
                key={step.id}
                className={`relative rounded-xl p-3.5 border transition-all duration-200 text-left flex flex-col justify-between ${
                  isCompleted
                    ? "bg-emerald-50/60 border-emerald-200 hover:border-emerald-300 cursor-pointer"
                    : isCurrent
                    ? "bg-gradient-to-br from-cyan-50/80 to-blue-50/60 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm cursor-pointer"
                    : isLocked
                    ? "bg-slate-50/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-85"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer text-slate-700"
                }`}
                onClick={() => handleStepClick(step)}
                onMouseEnter={() => setActiveTooltip(step.id)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* Step Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-sm"
                          : isCurrent
                          ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-sm animate-pulse"
                          : isLocked
                          ? "bg-slate-200 text-slate-500"
                          : "bg-white border border-slate-300 text-slate-700"
                      }`}
                    >
                      {isCompleted ? (
                        <FiCheck className="text-sm stroke-[3]" />
                      ) : isLocked ? (
                        <FiLock className="text-xs" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border truncate ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : isCurrent
                          ? "bg-cyan-100 text-cyan-900 border-cyan-300"
                          : isLocked
                          ? "bg-slate-200/70 text-slate-500 border-slate-300"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {step.statusLabel}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold ${
                      isCompleted
                        ? "text-emerald-950"
                        : isCurrent
                        ? "text-slate-900 font-extrabold"
                        : isLocked
                        ? "text-slate-500"
                        : "text-slate-800"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                    {step.tooltip}
                  </p>
                </div>

                {/* Step Action Trigger Footer */}
                <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold">
                  {isCompleted ? (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                      <FiCheckCircle className="text-xs" /> Completed
                    </span>
                  ) : isCurrent ? (
                    <span className="text-cyan-800 font-extrabold inline-flex items-center gap-1">
                      <span>{step.actionLabel || "Action Required"}</span>
                      <FiArrowRight className="text-xs animate-bounce-x" />
                    </span>
                  ) : isLocked ? (
                    <span className="text-slate-400 inline-flex items-center gap-1">
                      <FiLock className="text-[10px]" /> Locked
                    </span>
                  ) : (
                    <span className="text-slate-600 inline-flex items-center gap-1">
                      <span>Available</span>
                      <FiExternalLink className="text-[10px]" />
                    </span>
                  )}
                </div>

                {/* Interactive Tooltip on Hover */}
                {activeTooltip === step.id && (
                  <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl w-52 z-30 pointer-events-none transition-all duration-150">
                    <p className="leading-snug">{step.requirementMsg || step.tooltip}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Locked Step Notice Alert */}
        {lockedAlert && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-base text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Requirement Needed: </strong>
                <span>{lockedAlert}</span>
              </div>
            </div>
            <button
              onClick={() => setLockedAlert(null)}
              className="text-amber-700 hover:text-amber-950 font-bold text-xs shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Task 3: Primary Action / Continue Card */}
      {nextActiveStep && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-cyan-600/30 border border-cyan-400/30 text-cyan-300 flex items-center justify-center text-xl shrink-0">
              {nextActiveStep.icon || <FiArrowRight />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  Recommended Next Action
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Step {steps.findIndex((s) => s.id === nextActiveStep.id) + 1} of {steps.length}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                {nextActiveStep.actionLabel || nextActiveStep.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                {nextActiveStep.requirementMsg || nextActiveStep.tooltip}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-6 py-3 shadow-md hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 shrink-0 self-stretch sm:self-auto"
          >
            <span>{nextActiveStep.actionLabel || "Continue Journey"}</span>
            <FiArrowRight className="text-sm" />
          </button>
        </div>
      )}
    </div>
  )
}
