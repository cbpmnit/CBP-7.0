"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginSuccess, logout } from "@/store/slices/authSlice"

export function useAuth() {
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  return {
    ...authState,
    loginSuccess: (payload: any) => dispatch(loginSuccess(payload)),
    logout: handleLogout,
  }
}
