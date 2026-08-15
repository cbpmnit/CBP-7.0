"use client"

import React from "react"
import Link from "next/link"
import Reveal from "@/components/animations/RevealOnScroll"
import { FiShield, FiCheckCircle } from "react-icons/fi"

interface LoginFormSuccessProps {
  identifier: string
}

export function LoginFormSuccess({ identifier }: LoginFormSuccessProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto max-w-md w-full text-center">
        <Reveal variant="scale">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
            <FiCheckCircle className="h-10 w-10" />
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
            Login <span className="gradient-text-cyan">Successful!</span>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Welcome back! You have successfully logged into the CBP 7.0 Portal.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-8 bg-white rounded-3xl p-6 text-left border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <FiShield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Logged in as</p>
                <p className="text-sm font-bold text-slate-900">{identifier || "User"}</p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5"
          >
            Go to Dashboard
          </Link>
        </Reveal>
      </div>
    </main>
  )
}
