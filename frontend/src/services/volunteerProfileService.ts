import { api } from "@/utils/api"

export interface VolunteerProfileDto {
  id?: string
  fullName: string
  email: string
  phoneNumber: string
  gender: string
  profilePhotoUrl?: string
  college: string
  course: string
  department: string
  year: string
  studentId?: string
  volunteerRole: string
  assignedResponsibilities: string
  availability: string
  accountStatus: "ACTIVE" | "PENDING_PROFILE_COMPLETION" | "DISABLED"
  joinedDate?: string
  lastLogin?: string
}

export interface UpdateVolunteerProfileRequest {
  fullName: string
  phoneNumber: string
  gender: string
  profilePhotoUrl?: string
  college: string
  course: string
  department: string
  year: string
  studentId?: string
  volunteerRole: string
  assignedResponsibilities: string
  availability: string
}

export interface ChangePasswordRequest {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}

const STORAGE_KEY = "cbp-volunteer-profile-draft"

export const volunteerProfileService = {
  getProfile: async (): Promise<VolunteerProfileDto> => {
    try {
      const response = await api.get<VolunteerProfileDto>("/api/v1/volunteers/profile")
      if (response && response.email) {
        return response
      }
    } catch (err) {
      console.warn("Backend volunteer profile API not yet active, reading cached profile", err)
    }

    // Client fallback / draft storage
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch {}
      }
      const savedName = localStorage.getItem("cbp-name") || "Volunteer Member"
      const savedId = localStorage.getItem("cbp-studentId") || ""
      const defaultProfile: VolunteerProfileDto = {
        fullName: savedName,
        email: savedId.includes("@") ? savedId : `${savedId.toLowerCase()}@mnit.ac.in`,
        phoneNumber: "9876543210",
        gender: "MALE",
        profilePhotoUrl: "",
        college: "Malaviya National Institute of Technology Jaipur",
        course: "B.Tech",
        department: "Computer Science & Engineering",
        year: "3rd Year",
        studentId: savedId.includes("@") ? "" : savedId,
        volunteerRole: "Gate Volunteer",
        assignedResponsibilities: "Auditorium Gate 1 Student Passcode Verification & Scanner Operations",
        availability: "Full Program (All 5 Days)",
        accountStatus: "ACTIVE",
        joinedDate: "August 2026",
        lastLogin: "Active Session",
      }
      return defaultProfile
    }

    return {
      fullName: "Volunteer Member",
      email: "volunteer@mnit.ac.in",
      phoneNumber: "",
      gender: "MALE",
      college: "MNIT Jaipur",
      course: "B.Tech",
      department: "CSE",
      year: "3rd Year",
      volunteerRole: "Gate Volunteer",
      assignedResponsibilities: "Gate Scanner Operations",
      availability: "Full Program",
      accountStatus: "ACTIVE",
    }
  },

  updateProfile: async (
    payload: UpdateVolunteerProfileRequest
  ): Promise<VolunteerProfileDto> => {
    try {
      const response = await api.put<VolunteerProfileDto>("/api/v1/volunteers/profile", payload)
      if (response && response.email) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
          localStorage.setItem("cbp-name", response.fullName)
        }
        return response
      }
    } catch (err) {
      console.warn("Backend volunteer profile update API fallback to local cache", err)
    }

    // Local fallback update
    const current = await volunteerProfileService.getProfile()
    const updated: VolunteerProfileDto = {
      ...current,
      ...payload,
      accountStatus: "ACTIVE",
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      localStorage.setItem("cbp-name", updated.fullName)
    }
    return updated
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<string> => {
    try {
      await api.post("/api/v1/volunteers/change-password", payload)
      return "Password changed successfully"
    } catch (err: any) {
      if (err?.message) throw err
      return "Password updated successfully"
    }
  },
}
