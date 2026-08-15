"use client"

import React from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import {
  PROGRAM_LEVEL_OPTIONS,
  DEPARTMENT_OPTIONS,
  YEAR_OPTIONS,
} from "../../schemas/profileSchema"
import { FiBookOpen, FiAward, FiCalendar, FiGrid } from "react-icons/fi"

interface AcademicSectionProps {
  isEditing: boolean
  formData: {
    institute: string
    programLevel: string
    department: string
    year: number
    section?: string
    course?: string
    branch?: string
  }
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function AcademicSection({
  isEditing,
  formData,
  errors,
  onChange,
}: AcademicSectionProps) {
  const currentLevel = formData.programLevel || formData.course || "UNDERGRADUATE"
  const currentDept = formData.department || formData.branch || "Computer Science and Engineering"

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Institute</span>
          <p className="font-semibold text-slate-900">{formData.institute || "MNIT Jaipur"}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Program Level</span>
          <p className="font-semibold text-slate-900">{currentLevel}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Department</span>
          <p className="font-semibold text-slate-900">{currentDept}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Year of Study</span>
          <p className="font-semibold text-slate-900">{formData.year} Year</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Section</span>
          <p className="font-semibold text-slate-900">{formData.section || "N/A"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Input
          label="Institute / College"
          name="institute"
          icon={<FiBookOpen />}
          value={formData.institute}
          onChange={onChange}
          required
          error={errors.institute}
        />
      </div>

      <Select
        label="Program Level"
        name="programLevel"
        icon={<FiAward />}
        value={currentLevel}
        onChange={onChange}
        options={PROGRAM_LEVEL_OPTIONS}
        required
        error={errors.programLevel || errors.course}
      />

      <Select
        label="Department"
        name="department"
        icon={<FiGrid />}
        value={currentDept}
        onChange={onChange}
        options={DEPARTMENT_OPTIONS}
        required
        error={errors.department || errors.branch}
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

      <Input
        label="Section"
        name="section"
        placeholder="e.g. A"
        value={formData.section || ""}
        onChange={onChange}
        error={errors.section}
      />
    </div>
  )
}

export const AcademicInformationSection = AcademicSection
