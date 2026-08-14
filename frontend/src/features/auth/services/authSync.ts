import { store } from "@/store/store"
import { syncUserPermissions, logout, setValidatingSession } from "@/store/slices/authSlice"
import { UserResponse } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"

/**
 * Validates the current session token with the backend and synchronizes
 * latest permissions, roles, and user profile directly from the database.
 */
export async function validateAndSyncSession(): Promise<UserResponse | null> {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("cbp-token")
  if (!token) {
    store.dispatch(setValidatingSession(false))
    return null
  }

  try {
    store.dispatch(setValidatingSession(true))

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Session token expired or invalid. Logging out.")
        store.dispatch(logout())
        return null
      }
      // For temporary 500s or network drops, don't immediately logout
      store.dispatch(setValidatingSession(false))
      return null
    }

    const json = await response.json()
    const userData: UserResponse = json.data !== undefined ? json.data : json

    if (userData) {
      const perms = Array.isArray(userData.permissions)
        ? userData.permissions
        : []

      const roles = Array.isArray(userData.roles)
        ? userData.roles
        : userData.role
        ? [userData.role]
        : []

      store.dispatch(
        syncUserPermissions({
          userId: userData.userId || userData.id,
          studentId: userData.studentId,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          roles: roles,
          permissions: perms,
          accountSetupCompleted: userData.accountSetupCompleted,
        })
      )

      return userData
    }

    return null
  } catch (err) {
    console.warn("Permission sync background check error:", err)
    store.dispatch(setValidatingSession(false))
    return null
  }
}
