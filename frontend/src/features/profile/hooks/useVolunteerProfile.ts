"use client"

import { useState, useEffect } from "react"
import { useAppDispatch } from "@/store/hooks"
import { updateUserIdentity } from "@/store/slices/authSlice"
import { volunteerApi } from "@/features/volunteers/services/volunteerApi"
import { VolunteerProfileDto } from "@/features/volunteers/types"

export function useVolunteerProfile() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<VolunteerProfileDto>({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "MALE",
    profilePhotoUrl: "",
    college: "Malaviya National Institute of Technology Jaipur",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    studentId: "",
    volunteerRole: "Gate Volunteer",
    assignedResponsibilities: "Auditorium Gate 1 Scanner & Attendance Operations",
    availability: "Full Program (All 5 Days)",
    accountStatus: "ACTIVE",
    joinedDate: "August 2026",
    lastLogin: "Current Session",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await volunteerApi.getProfile()
      setFormData(data)
    } catch {
      setError("Failed to load volunteer profile data.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev: VolunteerProfileDto) => ({ ...prev, [name]: value }))
    if (message) setMessage(null)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setMessage(null)
    setError(null)

    try {
      const updated = await volunteerApi.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        college: formData.college,
        course: formData.course,
        department: formData.department,
        year: formData.year,
        studentId: formData.studentId,
        volunteerRole: formData.volunteerRole,
        assignedResponsibilities: formData.assignedResponsibilities,
        availability: formData.availability,
      })

      setFormData(updated)
      dispatch(
        updateUserIdentity({
          name: updated.fullName,
          studentId: updated.studentId,
        })
      )

      setMessage("Volunteer profile updated successfully!")
      setIsEditing(false)
    } catch {
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaveLoading(false)
    }
  }

  return {
    loading,
    saveLoading,
    isEditing,
    setIsEditing,
    message,
    error,
    formData,
    handleChange,
    handleSubmit,
  }
}
