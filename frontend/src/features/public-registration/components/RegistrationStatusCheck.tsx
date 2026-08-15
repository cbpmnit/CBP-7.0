"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { publicRegistrationApi } from "../services/publicRegistrationApi"
import { PublicStatusCheckResponse } from "../types"
import { FiSearch, FiCheckCircle, FiXCircle, FiUser, FiCalendar, FiCreditCard, FiShield, FiArrowLeft, FiArrowRight } from "react-icons/fi"

export function RegistrationStatusCheck() {
  const [searchMode, setSearchMode] = useState<"studentId" | "mobileNumber">("studentId")
  const [studentId, setStudentId] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PublicStatusCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const queryStudentId = searchMode === "studentId" ? studentId.trim() : undefined
    const queryMobile = searchMode === "mobileNumber" ? mobileNumber.trim() : undefined

    if (searchMode === "studentId" && !queryStudentId) {
      setError("Please enter your Student ID.")
      return
    }

    if (searchMode === "mobileNumber" && !queryMobile) {
      setError("Please enter your Mobile Number.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("[PUBLIC_REGISTRATION] Status check initiated", { queryStudentId, queryMobile })
      const res = await publicRegistrationApi.checkStatus({
        studentId: queryStudentId,
        mobileNumber: queryMobile,
      })
      setResult(res)
      if (res.registered) {
        console.log("[PUBLIC_REGISTRATION] Registration found", res)
      } else {
        console.log("[PUBLIC_REGISTRATION] Registration not found", res)
      }
    } catch (err: unknown) {
      console.error("[PUBLIC_REGISTRATION] Status check error", err)
      setError("Unable to verify registration status. Please verify your details and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            href="/registration"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-800 hover:text-cyan-900 transition-colors mb-2"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Back to Registration
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Check Registration Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Verify your official CBP 7.0 event registration and payment confirmation without logging in.
          </p>
        </div>

        {/* Search Card */}
        <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSearchMode("studentId")
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                searchMode === "studentId"
                  ? "bg-white text-cyan-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Search by Student ID
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode("mobileNumber")
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                searchMode === "mobileNumber"
                  ? "bg-white text-cyan-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Search by Mobile Number
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {searchMode === "studentId" ? (
              <Input
                label="Student ID / Roll Number"
                placeholder="e.g. 2024PUB001 or 2023UGCS001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoFocus
              />
            ) : (
              <Input
                label="Registered Mobile Number"
                placeholder="e.g. 9876543210"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                autoFocus
              />
            )}

            {error && (
              <Alert type="error" message={error} className="text-xs" />
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-cyan-800 hover:bg-cyan-900 text-white font-bold py-2.5"
            >
              <FiSearch className="mr-2" /> Check Status
            </Button>
          </form>

          {/* Search Result */}
          {result && (
            <div className="pt-4 border-t border-slate-200">
              {result.registered ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <FiCheckCircle className="h-8 w-8 text-emerald-800 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-900 text-sm">Registration Confirmed</h4>
                      <p className="text-xs text-emerald-700">{result.message}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <FiUser className="text-cyan-800" /> Participant Name:
                      </span>
                      <span className="font-bold text-slate-900">{result.name || "N/A"}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <FiShield className="text-cyan-800" /> Student ID:
                      </span>
                      <span className="font-mono font-bold text-slate-900">{result.studentId || "N/A"}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <FiCreditCard className="text-cyan-800" /> Payment Status:
                      </span>
                      <Badge variant="success">COMPLETED</Badge>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <FiShield className="text-emerald-800" /> Account Status:
                      </span>
                      <Badge variant={result.accountVerified ? "success" : "warning"}>
                        {result.accountVerified ? "VERIFIED" : "PENDING"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <FiCalendar className="text-cyan-800" /> Registration Date:
                      </span>
                      <span className="font-medium text-slate-700">{result.registrationDate || "N/A"}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link href="/registration">
                      <Button variant="outline" className="w-full text-xs font-semibold">
                        Register Another Participant
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <FiXCircle className="h-8 w-8 text-amber-800 shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">No Registration Found</h4>
                      <p className="text-xs text-amber-700">{result.message}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 text-center">
                    Please double-check your Student ID or Mobile Number. If you have not registered yet, you can register now.
                  </p>

                  <Link href="/registration" className="block">
                    <Button className="w-full bg-cyan-800 hover:bg-cyan-900 text-white font-bold py-2.5">
                      Proceed to Registration <FiArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default RegistrationStatusCheck
