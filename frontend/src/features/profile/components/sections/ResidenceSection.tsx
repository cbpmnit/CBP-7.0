"use client"

import React from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { STUDENT_TYPE_OPTIONS } from "../../schemas/profileSchema"
import { StudentType } from "../../types"
import { FiHome, FiMapPin, FiKey } from "react-icons/fi"

interface ResidenceSectionProps {
  isEditing: boolean
  formData: {
    studentType: StudentType
    address: string
    hostelNumber: string
    roomNumber: string
    city: string
    state: string
  }
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function ResidenceSection({
  isEditing,
  formData,
  errors,
  onChange,
}: ResidenceSectionProps) {
  const isHosteller = formData.studentType === "HOSTELLER"

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Student Category</span>
          <p className="font-bold text-slate-900 text-sm">
            {formData.studentType === "HOSTELLER" ? "Hosteller" : "Day Scholar"}
          </p>
        </div>
        {isHosteller ? (
          <>
            <div>
              <span className="font-bold text-slate-500 uppercase block mb-1">Hostel Number</span>
              <p className="font-semibold text-slate-900">{formData.hostelNumber || "Not Provided"}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase block mb-1">Room Number</span>
              <p className="font-semibold text-slate-900">{formData.roomNumber || "Not Provided"}</p>
            </div>
          </>
        ) : (
          <div className="md:col-span-2">
            <span className="font-bold text-slate-500 uppercase block mb-1">Residential Address</span>
            <p className="font-semibold text-slate-900">{formData.address || "Not Provided"}</p>
          </div>
        )}
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">City</span>
          <p className="font-semibold text-slate-900">{formData.city || "Not Provided"}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">State</span>
          <p className="font-semibold text-slate-900">{formData.state || "Not Provided"}</p>
        </div>
      </div>
    )
  }

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
            label="Hostel Number"
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
            placeholder="Enter full residential street address"
            value={formData.address}
            onChange={onChange}
            required
            error={errors.address}
          />
        </div>
      )}

      <Input
        label="City"
        name="city"
        placeholder="e.g. Jaipur"
        value={formData.city}
        onChange={onChange}
        error={errors.city}
      />

      <Input
        label="State"
        name="state"
        placeholder="e.g. Rajasthan"
        value={formData.state}
        onChange={onChange}
        error={errors.state}
      />
    </div>
  )
}

export const ResidenceInformationSection = ResidenceSection

