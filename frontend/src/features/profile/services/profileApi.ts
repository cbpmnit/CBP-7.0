import { apiClient } from "@/lib/apiClient"
import { UserProfileResponse, UserProfileRequest, ProfileCompletionResponse } from "@/features/profile/types"

export const profileApi = {
  getProfile: () => apiClient.get<UserProfileResponse>("/api/v1/profile/me"),
  createProfile: (data: UserProfileRequest) => apiClient.post<UserProfileResponse>("/api/v1/profile", data),
  updateProfile: (data: UserProfileRequest) => apiClient.put<UserProfileResponse>("/api/v1/profile", data),
  getCompletion: () => apiClient.get<ProfileCompletionResponse>("/api/v1/profile/completion"),
}

export default profileApi
