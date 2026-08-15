"use client"

import React from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { STUDENT_TYPE_OPTIONS } from "../constants"
import { PublicRegistrationFormData } from "../types"
import { FiHome, FiMapPin, FiKey } from "react-icons/fi"

interface ResidenceInformationSectionProps {
  formData: PublicRegistrationFormData
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function ResidenceInformationSection({
  formData,
  errors,
  onChange,
}: ResidenceInformationSectionProps) {
  const isHosteller = formData.studentType === "HOSTELLER"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Select
          label="Student Residence Category"
          name="studentType"
          icon={<FiHome />}
          value={formData.studentType}
          onChange={onChange}
          options={STUDENT_TYPE_OPTIONS}
          required
          error={errors.studentType}
        />
      </div>

      {isHosteller ? (
        <>
          <Input
            label="Hostel Number / Name"
            name="hostelNumber"
            icon={<FiHome />}
            placeholder="e.g. H-10 / Hostel 5"
            value={formData.hostelNumber}
            onChange={onChange}
            required
            error={errors.hostelNumber}
          />

          <Input
            label="Room Number"
            name="roomNumber"
            icon={<FiKey />}
            placeholder="e.g. 204"
            value={formData.roomNumber}
            onChange={onChange}
            required
            error={errors.roomNumber}
          />
        </>
      ) : (
        <div className="md:col-span-2">
          <Input
            label="Residential Address"
            name="address"
            icon={<FiMapPin />}
            placeholder="Enter complete street residential address"
            value={formData.address}
            onChange={onChange}
            required
            error={errors.address}
          />
        </div>
      )}
    </div>
  )
}
