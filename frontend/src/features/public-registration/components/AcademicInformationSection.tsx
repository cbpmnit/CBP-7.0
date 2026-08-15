"use client"

import React from "react"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import {
  PROGRAM_LEVEL_OPTIONS,
  DEPARTMENT_OPTIONS,
  YEAR_OPTIONS,
} from "../constants"
import { PublicRegistrationFormData } from "../types"
import { FiAward, FiGrid, FiCalendar, FiEdit3 } from "react-icons/fi"

interface AcademicInformationSectionProps {
  formData: PublicRegistrationFormData
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function AcademicInformationSection({
  formData,
  errors,
  onChange,
}: AcademicInformationSectionProps) {
  const isOtherDepartment = formData.department === "Other" || formData.department === "OTHER"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Program Level"
          name="programLevel"
          icon={<FiAward />}
          value={formData.programLevel}
          onChange={onChange}
          options={PROGRAM_LEVEL_OPTIONS}
          required
          error={errors.programLevel}
        />

        <Select
          label="Department"
          name="department"
          icon={<FiGrid />}
          value={formData.department}
          onChange={onChange}
          options={DEPARTMENT_OPTIONS}
          required
          error={errors.department}
        />

        <Select
          label="Year of Study"
          name="year"
          icon={<FiCalendar />}
          value={formData.year}
          onChange={onChange}
          options={YEAR_OPTIONS}
          required
          error={errors.year}
        />
      </div>

      {isOtherDepartment && (
        <Input
          label="Other Department Name"
          name="customDepartment"
          icon={<FiEdit3 />}
          placeholder="Please enter your specific department name"
          value={formData.customDepartment}
          onChange={onChange}
          required
          error={errors.customDepartment}
        />
      )}
    </div>
  )
}
