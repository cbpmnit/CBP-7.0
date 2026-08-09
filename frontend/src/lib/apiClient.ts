import { store } from "@/store/store"
import { logout } from "@/store/slices/authSlice"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"

export interface ApiErrorResponse {
  success: boolean
  status: number
  error: string
  message: string
  errors?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  errorData: ApiErrorResponse

  constructor(status: number, errorData: ApiErrorResponse) {
    super(errorData.message || "An error occurred")
    this.status = status
    this.errorData = errorData
    this.name = "ApiError"
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`

  // Extract token from Redux store first, fallback to localStorage
  let token = store.getState().auth.token
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("cbp-token")
  }

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const config: RequestInit = {
    ...options,
    headers,
    cache: "no-store",
  }

  let response: Response
  try {
    response = await fetch(url, config)
  } catch (networkErr: any) {
    const errorData: ApiErrorResponse = {
      success: false,
      status: 0,
      error: "NetworkError",
      message: networkErr?.message || "Unable to reach the server. Please check your network connection and retry.",
    }
    throw new ApiError(0, errorData)
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse
    try {
      errorData = await response.json()
    } catch {
      errorData = {
        success: false,
        status: response.status,
        error: response.statusText,
        message: response.status === 403 
          ? "Access denied. You do not have permission to perform this action."
          : response.status === 404
          ? "The requested resource was not found."
          : response.status >= 500
          ? "Internal server error. Please try again later."
          : "An unexpected error occurred",
      }
    }

    // Auto-logout ONLY on 401 Unauthorized (session expired or invalid token), not on 403 Forbidden
    if (
      response.status === 401 &&
      !path.endsWith("/auth/login") &&
      typeof window !== "undefined"
    ) {
      store.dispatch(logout())
      window.location.href = "/login"
    }

    throw new ApiError(response.status, errorData)
  }

  // Handle empty or void responses (e.g. DELETE or some POST responses returning string)
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    const json = await response.json()
    return json.data !== undefined ? json.data : json
  }

  const text = await response.text()
  try {
    const parsed = JSON.parse(text)
    return parsed.data !== undefined ? parsed.data : parsed
  } catch {
    return text as unknown as T
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
}

// Backward compatibility alias for api
export const api = apiClient
