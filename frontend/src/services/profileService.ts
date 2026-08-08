import { api } from "@/utils/api"
import { UserProfileResponse, UserProfileRequest, ProfileCompletionResponse } from "@/types/profile"

export const profileService = {
  getProfile: () => api.get<UserProfileResponse>("/api/v1/profile/me"),
  createProfile: (data: UserProfileRequest) => api.post<UserProfileResponse>("/api/v1/profile", data),
  updateProfile: (data: UserProfileRequest) => api.put<UserProfileResponse>("/api/v1/profile", data),
  getCompletion: () => api.get<ProfileCompletionResponse>("/api/v1/profile/completion"),
}
