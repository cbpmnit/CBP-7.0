import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface AuthState {
  token: string | null
  studentId: string | null
  role: string | null
  name: string | null
  permissions: string[]
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: null,
  studentId: null,
  role: null,
  name: null,
  permissions: [],
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; studentId: string; role: string; name: string; permissions?: string[] }>
    ) => {
      state.token = action.payload.token
      state.studentId = action.payload.studentId
      state.role = action.payload.role
      state.name = action.payload.name
      state.permissions = action.payload.permissions || []
      state.isAuthenticated = true
      state.loading = false
      state.error = null

      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-token", action.payload.token)
        localStorage.setItem("cbp-studentId", action.payload.studentId)
        localStorage.setItem("cbp-role", action.payload.role)
        localStorage.setItem("cbp-name", action.payload.name)
        localStorage.setItem("cbp-permissions", JSON.stringify(action.payload.permissions || []))
      }
    },
    logout: (state) => {
      state.token = null
      state.studentId = null
      state.role = null
      state.name = null
      state.permissions = []
      state.isAuthenticated = false
      state.loading = false
      state.error = null

      if (typeof window !== "undefined") {
        localStorage.removeItem("cbp-token")
        localStorage.removeItem("cbp-studentId")
        localStorage.removeItem("cbp-role")
        localStorage.removeItem("cbp-name")
        localStorage.removeItem("cbp-permissions")
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    restoreAuth: (
      state,
      action: PayloadAction<{ token: string; studentId: string; role: string; name: string; permissions?: string[] }>
    ) => {
      state.token = action.payload.token
      state.studentId = action.payload.studentId
      state.role = action.payload.role
      state.name = action.payload.name
      state.permissions = action.payload.permissions || []
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
  },
})

export const { loginSuccess, logout, setAuthLoading, setAuthError, restoreAuth } = authSlice.actions
export default authSlice.reducer
