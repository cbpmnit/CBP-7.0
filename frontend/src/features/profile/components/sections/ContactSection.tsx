"use client"

import React from "react"
import { Input } from "@/components/ui/Input"
import { FiPhone, FiMessageSquare } from "react-icons/fi"

interface ContactSectionProps {
  isEditing: boolean
  formData: {
    phoneNumber: string
    sameAsWhatsapp: boolean
    whatsappNumber: string
  }
  errors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function ContactSection({
  isEditing,
  formData,
  errors,
  onChange,
}: ContactSectionProps) {
  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">Phone Number</span>
          <p className="font-semibold text-slate-900">{formData.phoneNumber || "Not Provided"}</p>
        </div>
        <div>
          <span className="font-bold text-slate-500 uppercase block mb-1">WhatsApp Number</span>
          <p className="font-semibold text-slate-900">
            {formData.sameAsWhatsapp
              ? `${formData.phoneNumber || "N/A"} (Same as primary)`
              : formData.whatsappNumber || "Not Provided"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        icon={<FiPhone />}
        placeholder="10 digit phone number"
        value={formData.phoneNumber}
        onChange={onChange}
        required
        error={errors.phoneNumber}
      />

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-2">
          <input
            type="checkbox"
            name="sameAsWhatsapp"
            checked={formData.sameAsWhatsapp}
            onChange={onChange}
            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
          />
          <span>WhatsApp number same as primary phone number</span>
        </label>

        {!formData.sameAsWhatsapp && (
          <Input
            label="WhatsApp Number"
            name="whatsappNumber"
            type="tel"
            icon={<FiMessageSquare />}
            placeholder="10 digit WhatsApp number"
            value={formData.whatsappNumber}
            onChange={onChange}
            error={errors.whatsappNumber}
          />
        )}
      </div>
    </div>
  )
}
