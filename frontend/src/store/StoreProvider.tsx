"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store"

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.setItem("cbp-theme", "light")
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")
  }, [])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeInitializer>{children}</ThemeInitializer>
    </Provider>
  )
}
