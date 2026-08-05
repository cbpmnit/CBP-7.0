"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { useAppDispatch, useAppSelector } from "./hooks"
import { setTheme, ThemeMode } from "./slices/themeSlice"
import { restoreAuth } from "./slices/authSlice"

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)

  useEffect(() => {
    // Restore Theme
    const savedTheme = localStorage.getItem("cbp-theme") as ThemeMode
    if (savedTheme === "light" || savedTheme === "dark") {
      dispatch(setTheme(savedTheme))
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      dispatch(setTheme("light"))
    }

    // Restore Auth
    const token = localStorage.getItem("cbp-token")
    const studentId = localStorage.getItem("cbp-studentId")
    const role = localStorage.getItem("cbp-role")
    const name = localStorage.getItem("cbp-name")

    if (token && studentId && role && name) {
      dispatch(restoreAuth({ token, studentId, role, name }))
    }
  }, [dispatch])

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    }
  }, [theme])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  )
}
