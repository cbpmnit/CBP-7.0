"use client"

import React from "react"
import { PersonalInformationSection } from "./PersonalInformationSection"
import { AcademicInformationSection } from "./AcademicInformationSection"
import { ResidenceInformationSection } from "./ResidenceInformationSection"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { PublicRegistrationFormData } from "../types"
import { FiUser, FiBookOpen, FiHome, FiArrowRight } from "react-icons/fi"

interface RegistrationFormProps {
  formData: PublicRegistrationFormData
  errors: Record<string, string>
  errorMessage: string | null
  loading: boolean
  paymentAmount: number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

export function RegistrationForm({
  formData,
  errors,
  errorMessage,
  loading,
  paymentAmount,
  onChange,
  onSubmit,
}: RegistrationFormProps) {
  const formattedAmount = `₹${(paymentAmount || 100).toFixed(2)}`

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {errorMessage && (
        <Alert type="error" title="Registration Error" message={errorMessage} />
      )}

      {/* Personal Section */}
      <div className="bg-slate-50/70 border border-slate-200 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <FiUser className="text-cyan-800 h-5 w-5" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            1. Personal Details
          </h3>
        </div>
        <PersonalInformationSection formData={formData} errors={errors} onChange={onChange} />
      </div>

      {/* Academic Section */}
      <div className="bg-slate-50/70 border border-slate-200 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <FiBookOpen className="text-cyan-800 h-5 w-5" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            2. Academic Details
          </h3>
        </div>
        <AcademicInformationSection formData={formData} errors={errors} onChange={onChange} />
      </div>

      {/* Residence Section */}
      <div className="bg-slate-50/70 border border-slate-200 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <FiHome className="text-cyan-800 h-5 w-5" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            3. Residence &amp; Category Details
          </h3>
        </div>
        <ResidenceInformationSection formData={formData} errors={errors} onChange={onChange} />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 font-medium">
          Fee payable upon submission: <span className="font-extrabold text-slate-900">{formattedAmount}</span>
        </p>

        <Button
          type="submit"
          loading={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-cyan-800 to-blue-900 hover:from-cyan-900 hover:to-blue-950 text-white px-8 py-3 font-bold rounded-xl shadow-md"
        >
          Proceed to Payment <FiArrowRight className="ml-2" />
        </Button>
      </div>
    </form>
  )
}
