"use client"

import { useAppSelector } from "@/store/hooks"
import { validateAndSyncSession } from "../services/authSync"

export function usePermissions() {
  const { role, roles, permissions, isValidatingSession } = useAppSelector(
    (state) => state.auth
  )

  const effectiveRole = (role || "").toUpperCase()
  const isAdmin =
    effectiveRole === "ROLE_ADMIN" ||
    effectiveRole === "ADMIN" ||
    (roles && roles.some((r) => r.toUpperCase() === "ROLE_ADMIN" || r.toUpperCase() === "ADMIN"))

  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: string[]): boolean => {
    if (isAdmin) return true
    return perms.some((p) => permissions.includes(p))
  }

  const hasAllPermissions = (perms: string[]): boolean => {
    if (isAdmin) return true
    return perms.every((p) => permissions.includes(p))
  }

  const refreshPermissions = async () => {
    return await validateAndSyncSession()
  }

  return {
    permissions,
    role,
    roles,
    isAdmin,
    isValidatingSession,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
  }
}

export default usePermissions
