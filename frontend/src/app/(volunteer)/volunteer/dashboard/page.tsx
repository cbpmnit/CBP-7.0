"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { volunteerApi } from "@/features/volunteers/services/volunteerApi"
import { VolunteerProfileDto } from "@/features/volunteers/types"
import { attendanceApi } from "@/features/attendance/services/attendanceApi"
import { AttendanceSessionDto } from "@/features/attendance/types"
import PageTransition from "@/components/animations/PageTransition"
import Reveal from "@/components/animations/RevealOnScroll"
import {
  FiCamera,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiUser,
  FiLock,
  FiArrowRight,
} from "react-icons/fi"

export default function VolunteerDashboardPage() {
  const [profile, setProfile] = useState<VolunteerProfileDto | null>(null)
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profData, sessData] = await Promise.allSettled([
          volunteerApi.getProfile(),
          attendanceApi.getVolunteerSessions(),
        ])

        if (profData.status === "fulfilled") {
          setProfile(profData.value)
        }

        if (sessData.status === "fulfilled") {
          // Filter to only show active or upcoming sessions for simplicity
          const filtered = sessData.value.filter(
            (s) => s.status === "ACTIVE" || s.status === "UPCOMING"
          )
          setSessions(filtered)
        }

        if (typeof window !== "undefined") {
          const rawPerms = localStorage.getItem("cbp-permissions")
          if (rawPerms) {
            setPermissions(JSON.parse(rawPerms))
          }
        }
      } catch (err) {
        console.error("Failed to load volunteer dashboard details", err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-3">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Initializing Workspace...
        </span>
      </div>
    )
  }

  const hasScanner = permissions.includes("ATTENDANCE_SCAN")
  const hasStudentView = permissions.includes("STUDENT_VIEW")
  const hasAttendanceView = permissions.includes("ATTENDANCE_VIEW")
  const hasSessionView = permissions.includes("SESSION_VIEW") || permissions.includes("SESSION_MANAGE")

  return (
    <PageTransition>
      <div className="dashboard-container space-y-6">
        {/* Minimal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-cyan-700"><FiShield /></span>
              <span>Volunteer Dashboard</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug">
              Your Tasks
            </p>
          </div>
          <span className="self-start sm:self-center inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 border border-cyan-200 text-cyan-800">
            Active Volunteer
          </span>
        </div>

        {/* Volunteer Access Credentials Card */}
        <Reveal variant="up">
          <div className="access-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-slate-400 text-sm"><FiUser /></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Assignment
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{profile?.fullName || "Parv Agrawal"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">Role</span>
                <span className="font-extrabold text-cyan-800 text-sm">{profile?.volunteerRole || "Attendance Volunteer"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">Access</span>
              {permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {permissions.map((perm) => {
                    let label = perm;
                    if (perm === "ATTENDANCE_SCAN") label = "Attendance Scanner";
                    else if (perm === "ATTENDANCE_VIEW") label = "Attendance Records";
                    else if (perm === "STUDENT_VIEW") label = "Student Directory";
                    else if (perm === "SESSION_VIEW" || perm === "SESSION_MANAGE") label = "Session Settings";
                    else if (perm === "EMAIL_SEND") label = "Notification Templates";
                    return (
                      <span key={perm} className="permission-chip">
                        {label}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <FiLock className="text-slate-400" /> Basic Access Only
                </span>
              )}
            </div>
          </div>
        </Reveal>

        {/* Operational Workspace Action Tiles */}
        <Reveal variant="up" delay={80}>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operational Workspace
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {hasScanner && (
                <Link href="/volunteer/scanner" className="action-card text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-700 text-base"><FiCamera /></span>
                    <div>
                      <span className="font-bold text-slate-900 block">Attendance Scanner</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Scan student QR passes</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 uppercase flex items-center gap-0.5 group hover:translate-x-0.5 transition duration-200">
                    Open <FiArrowRight className="text-[11px]" />
                  </span>
                </Link>
              )}

              {hasAttendanceView && (
                <Link href="/admin/attendance" className="action-card text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-700 text-base"><FiCheckCircle /></span>
                    <div>
                      <span className="font-bold text-slate-900 block">Attendance Logs</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Review attendance</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 uppercase flex items-center gap-0.5 group hover:translate-x-0.5 transition duration-200">
                    Open <FiArrowRight className="text-[11px]" />
                  </span>
                </Link>
              )}

              {hasStudentView && (
                <Link href="/admin/students" className="action-card text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-700 text-base"><FiUsers /></span>
                    <div>
                      <span className="font-bold text-slate-900 block">Student Directory</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Search &amp; verify profiles</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 uppercase flex items-center gap-0.5 group hover:translate-x-0.5 transition duration-200">
                    Open <FiArrowRight className="text-[11px]" />
                  </span>
                </Link>
              )}

              {hasSessionView && (
                <Link href="/admin/sessions" className="action-card text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-700 text-base"><FiCalendar /></span>
                    <div>
                      <span className="font-bold text-slate-900 block">Session Management</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">View schedules &amp; timelines</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 uppercase flex items-center gap-0.5 group hover:translate-x-0.5 transition duration-200">
                    Open <FiArrowRight className="text-[11px]" />
                  </span>
                </Link>
              )}

              {!hasScanner && !hasAttendanceView && !hasStudentView && !hasSessionView && (
                <div className="sm:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <FiLock />
                  <span>No active workspace modules assigned to your permissions scope.</span>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Assigned Sessions */}
        {sessions.length > 0 && (
          <Reveal variant="up" delay={120}>
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned Sessions
              </h3>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <div key={sess.id} className="session-item">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="font-bold text-slate-900">{sess.title}</span>
                    </div>
                    <span
                      className={`status-badge ${
                        sess.status === "ACTIVE" ? "active" : "upcoming"
                      }`}
                    >
                      {sess.status === "ACTIVE" ? "Active" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </PageTransition>
  )
}
