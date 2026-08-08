/**
 * Utility functions for checking scope-based permissions on the frontend.
 */

export function getStoredPermissions(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("cbp-permissions")
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function hasPermission(permission: string, userPermissions?: string[], userRole?: string): boolean {
  // ADMIN role has all permissions implicitly
  const role = (userRole || (typeof window !== "undefined" ? localStorage.getItem("cbp-role") : "") || "").toUpperCase()
  if (role === "ROLE_ADMIN" || role === "ADMIN") {
    return true
  }

  const permissions = userPermissions || getStoredPermissions()
  if (!permissions || permissions.length === 0) {
    return false
  }

  return permissions.includes(permission)
}
