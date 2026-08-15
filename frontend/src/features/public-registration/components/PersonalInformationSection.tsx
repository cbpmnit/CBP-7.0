"use client"

import React from "react"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { PublicRegistrationFormData } from "../types"
import { FiUser, FiHash, FiMail, FiPhone, FiMessageSquare } from "react-icons/fi"

interface PersonalInformationSectionProps {
  formData: PublicRegistrationFormData
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function PersonalInformationSection({
  formData,
  errors,
  onChange,
}: PersonalInformationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="fullName"
          icon={<FiUser />}
          placeholder="e.g. Parv Agrawal"
          value={formData.fullName}
          onChange={onChange}
          required
          error={errors.fullName}
        />

        <Input
          label="Student ID / College Roll Number"
          name="studentId"
          icon={<FiHash />}
          placeholder="e.g. 2024UCP1234"
          value={formData.studentId}
          onChange={onChange}
          required
          error={errors.studentId}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          icon={<FiMail />}
          placeholder="e.g. student@mnit.ac.in"
          value={formData.email}
          onChange={onChange}
          required
          error={errors.email}
        />

        <Input
          label="Mobile Number (10 Digits)"
          name="mobileNumber"
          type="tel"
          icon={<FiPhone />}
          placeholder="e.g. 9876543210"
          value={formData.mobileNumber}
          onChange={onChange}
          required
          error={errors.mobileNumber}
        />
      </div>

      <Textarea
        label="Expectations from CBP 7.0 (Optional)"
        name="expectations"
        placeholder="Tell us what skills or knowledge you hope to gain..."
        value={formData.expectations}
        onChange={onChange}
        rows={3}
      />
    </div>
  )
}
