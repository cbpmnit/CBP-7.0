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
  const url = `${API_BASE_URL}${path}`

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
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorData: ApiErrorResponse
    try {
      errorData = await response.json()
    } catch {
      errorData = {
        success: false,
        status: response.status,
        error: response.statusText,
        message: "An unexpected error occurred",
      }
    }

    // Auto-logout on 401 or 403, unless it's the login endpoint
    if (
      (response.status === 401 || response.status === 403) &&
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

export const api = {
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
