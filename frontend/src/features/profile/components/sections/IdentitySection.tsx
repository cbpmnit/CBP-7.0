"use client"

import React from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { GENDER_OPTIONS } from "../../schemas/profileSchema"
import { FiUser, FiCalendar } from "react-icons/fi"

interface IdentitySectionProps {
  isEditing: boolean
  formData: {
    studentId: string
    firstName: string
    middleName: string
    lastName: string
    gender: string
    dateOfBirth: string
  }
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function IdentitySection({
  isEditing,
  formData,
  errors,
  onChange,
}: IdentitySectionProps) {
  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Full Name</span>
          <p className="font-semibold text-slate-900 text-sm">
            {[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ")}
          </p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Student ID</span>
          <p className="font-mono font-bold text-slate-900">{formData.studentId || "Pending Setup"}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Gender</span>
          <p className="font-semibold text-slate-900">{formData.gender.replace(/_/g, " ")}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Date of Birth</span>
          <p className="font-semibold text-slate-900">{formData.dateOfBirth || "Not Provided"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        label="First Name"
        name="firstName"
        icon={<FiUser />}
        placeholder="First Name"
        value={formData.firstName}
        onChange={onChange}
        required
        error={errors.firstName}
      />

      <Input
        label="Middle Name"
        name="middleName"
        placeholder="Middle Name (Optional)"
        value={formData.middleName}
        onChange={onChange}
        error={errors.middleName}
      />

      <Input
        label="Last Name"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={onChange}
        required
        error={errors.lastName}
      />

      <Select
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={onChange}
        options={GENDER_OPTIONS}
        required
        error={errors.gender}
      />

      <Input
        label="Date of Birth"
        name="dateOfBirth"
        type="date"
        icon={<FiCalendar />}
        value={formData.dateOfBirth}
        onChange={onChange}
        error={errors.dateOfBirth}
      />
    </div>
  )
}
