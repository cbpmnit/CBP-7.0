import { api } from "@/utils/api"
import {
  ChangePasswordRequest,
  CompleteAccountRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SetupPasswordRequest,
  UserResponse,
} from "../types"

export const authApi = {
  login: (payload: LoginRequest) => api.post<LoginResponse>("/api/v1/auth/login", payload),
  register: (payload: RegisterRequest) => api.post<UserResponse>("/api/v1/auth/register", payload),
  getCurrentUser: () => api.get<UserResponse>("/api/v1/auth/me"),
  completeAccount: (payload: CompleteAccountRequest) => api.post<LoginResponse>("/api/v1/auth/complete-account", payload),
  setupPassword: (payload: SetupPasswordRequest) => api.post<LoginResponse>("/api/v1/auth/password/setup", payload),
  changePassword: (payload: ChangePasswordRequest) => api.post<string>("/api/v1/auth/password/change", payload),
}

export default authApi
