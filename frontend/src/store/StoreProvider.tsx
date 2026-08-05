"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { useAppDispatch, useAppSelector } from "./hooks"
import { setTheme, ThemeMode } from "./slices/themeSlice"

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)

  useEffect(() => {
    const saved = localStorage.getItem("cbp-theme") as ThemeMode
    if (saved === "light" || saved === "dark") {
      dispatch(setTheme(saved))
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      dispatch(setTheme("light"))
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
      <ThemeInitializer>{children}</ThemeInitializer>
    </Provider>
  )
}
