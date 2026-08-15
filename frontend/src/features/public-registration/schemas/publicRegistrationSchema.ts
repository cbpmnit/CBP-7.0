import { PublicRegistrationFormData } from "../types"

export function validatePublicRegistrationForm(formData: PublicRegistrationFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!formData.fullName.trim()) {
    errors.fullName = "Full name is required"
  }

  if (!formData.studentId.trim()) {
    errors.studentId = "Student ID is required"
  }

  if (!formData.email.trim()) {
    errors.email = "Email address is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = "Please enter a valid email address"
  }

  if (!formData.mobileNumber.trim()) {
    errors.mobileNumber = "Mobile number is required"
  } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
    errors.mobileNumber = "Mobile number must be exactly 10 digits"
  }

  if (!formData.programLevel) {
    errors.programLevel = "Program level is required"
  }

  if (!formData.department || !formData.department.trim()) {
    errors.department = "Department is required"
  } else if (formData.department === "Other" || formData.department === "OTHER") {
    if (!formData.customDepartment || !formData.customDepartment.trim()) {
      errors.customDepartment = "Please specify your department name when selecting 'Other'"
    }
  }

  const numericYear = Number(formData.year)
  if (!numericYear || numericYear < 1 || numericYear > 5) {
    errors.year = "Year of study must be between 1 and 5"
  }

  if (!formData.studentType) {
    errors.studentType = "Student category is required"
  }

  if (formData.studentType === "DAY_SCHOLAR") {
    if (!formData.address || !formData.address.trim()) {
      errors.address = "Residential address is required for Day Scholars"
    }
  } else if (formData.studentType === "HOSTELLER") {
    if (!formData.hostelNumber || !formData.hostelNumber.trim()) {
      errors.hostelNumber = "Hostel number is required for Hostellers"
    }
    if (!formData.roomNumber || !formData.roomNumber.trim()) {
      errors.roomNumber = "Room number is required for Hostellers"
    }
  }

  return errors
}
