import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface AuthState {
  token: string | null
  userId: string | null
  studentId: string | null
  email: string | null
  role: string | null
  roles: string[]
  name: string | null
  permissions: string[]
  accountSetupCompleted: boolean
  isAuthenticated: boolean
  isValidatingSession: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: null,
  userId: null,
  studentId: null,
  email: null,
  role: null,
  roles: [],
  name: null,
  permissions: [],
  accountSetupCompleted: false,
  isAuthenticated: false,
  isValidatingSession: true,
  loading: false,
  error: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        token: string
        userId?: string
        studentId: string
        email?: string
        role: string
        roles?: string[]
        name: string
        permissions?: string[]
        accountSetupCompleted?: boolean
      }>
    ) => {
      state.token = action.payload.token
      state.userId = action.payload.userId || null
      state.studentId = action.payload.studentId
      state.email = action.payload.email || null
      state.role = action.payload.role
      state.roles = action.payload.roles || (action.payload.role ? [action.payload.role] : [])
      state.name = action.payload.name
      state.permissions = action.payload.permissions || []
      state.accountSetupCompleted = action.payload.accountSetupCompleted ?? true
      state.isAuthenticated = true
      state.isValidatingSession = false
      state.loading = false
      state.error = null

      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-token", action.payload.token)
        localStorage.setItem("cbp-studentId", action.payload.studentId || "")
        localStorage.setItem("cbp-role", action.payload.role)
        localStorage.setItem("cbp-name", action.payload.name)
        localStorage.setItem("cbp-permissions", JSON.stringify(action.payload.permissions || []))
        localStorage.setItem("cbp-accountSetupCompleted", String(state.accountSetupCompleted))
        if (action.payload.userId) localStorage.setItem("cbp-userId", action.payload.userId)
        if (action.payload.roles) localStorage.setItem("cbp-roles", JSON.stringify(action.payload.roles))
        if (action.payload.email) localStorage.setItem("cbp-email", action.payload.email)
      }
    },

    syncUserPermissions: (
      state,
      action: PayloadAction<{
        userId?: string
        studentId?: string
        email?: string
        role?: string
        roles?: string[]
        name?: string
        permissions: string[]
        accountSetupCompleted?: boolean
      }>
    ) => {
      if (action.payload.permissions) {
        state.permissions = action.payload.permissions
      }
      if (action.payload.role) {
        state.role = action.payload.role
      }
      if (action.payload.roles) {
        state.roles = action.payload.roles
      }
      if (action.payload.name) {
        state.name = action.payload.name
      }
      if (action.payload.studentId !== undefined) {
        state.studentId = action.payload.studentId
      }
      if (action.payload.userId) {
        state.userId = action.payload.userId
      }
      if (action.payload.email) {
        state.email = action.payload.email
      }
      if (action.payload.accountSetupCompleted !== undefined) {
        state.accountSetupCompleted = action.payload.accountSetupCompleted
      }
      state.isValidatingSession = false
      state.isAuthenticated = true

      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-permissions", JSON.stringify(state.permissions))
        if (state.role) localStorage.setItem("cbp-role", state.role)
        if (state.roles.length) localStorage.setItem("cbp-roles", JSON.stringify(state.roles))
        if (state.name) localStorage.setItem("cbp-name", state.name)
        if (state.studentId) localStorage.setItem("cbp-studentId", state.studentId)
        if (state.userId) localStorage.setItem("cbp-userId", state.userId)
        localStorage.setItem("cbp-accountSetupCompleted", String(state.accountSetupCompleted))
      }
    },

    updateUserIdentity: (
      state,
      action: PayloadAction<{
        name?: string
        studentId?: string
        email?: string
        phoneNumber?: string
        accountSetupCompleted?: boolean
      }>
    ) => {
      if (action.payload.name) {
        state.name = action.payload.name
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-name", action.payload.name)
        }
      }
      if (action.payload.studentId) {
        state.studentId = action.payload.studentId
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-studentId", action.payload.studentId)
        }
      }
      if (action.payload.email) {
        state.email = action.payload.email
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-email", action.payload.email)
        }
      }
      if (action.payload.accountSetupCompleted !== undefined) {
        state.accountSetupCompleted = action.payload.accountSetupCompleted
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-accountSetupCompleted", String(action.payload.accountSetupCompleted))
        }
      }
    },

    restoreAuth: (
      state,
      action: PayloadAction<{
        token: string
        userId?: string
        studentId: string
        email?: string
        role: string
        roles?: string[]
        name: string
        permissions?: string[]
        accountSetupCompleted?: boolean
      }>
    ) => {
      state.token = action.payload.token
      state.userId = action.payload.userId || null
      state.studentId = action.payload.studentId
      state.email = action.payload.email || null
      state.role = action.payload.role
      state.roles = action.payload.roles || (action.payload.role ? [action.payload.role] : [])
      state.name = action.payload.name
      state.permissions = action.payload.permissions || []
      state.accountSetupCompleted = action.payload.accountSetupCompleted ?? false
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },

    setValidatingSession: (state, action: PayloadAction<boolean>) => {
      state.isValidatingSession = action.payload
    },

    logout: (state) => {
      state.token = null
      state.userId = null
      state.studentId = null
      state.email = null
      state.role = null
      state.roles = []
      state.name = null
      state.permissions = []
      state.accountSetupCompleted = false
      state.isAuthenticated = false
      state.isValidatingSession = false
      state.loading = false
      state.error = null

      if (typeof window !== "undefined") {
        localStorage.removeItem("cbp-token")
        localStorage.removeItem("cbp-userId")
        localStorage.removeItem("cbp-studentId")
        localStorage.removeItem("cbp-email")
        localStorage.removeItem("cbp-role")
        localStorage.removeItem("cbp-roles")
        localStorage.removeItem("cbp-name")
        localStorage.removeItem("cbp-permissions")
        localStorage.removeItem("cbp-accountSetupCompleted")
      }
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const {
  loginSuccess,
  syncUserPermissions,
  updateUserIdentity,
  restoreAuth,
  setValidatingSession,
  logout,
  setAuthLoading,
  setAuthError,
} = authSlice.actions

export default authSlice.reducer
