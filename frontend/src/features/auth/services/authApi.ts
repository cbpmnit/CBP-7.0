import { api } from "@/utils/api"
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from "../types"

export const authApi = {
  login: (payload: LoginRequest) => api.post<LoginResponse>("/api/v1/auth/login", payload),
  register: (payload: RegisterRequest) => api.post<UserResponse>("/api/v1/auth/register", payload),
  getCurrentUser: () => api.get<UserResponse>("/api/v1/auth/me"),
}

export default authApi
