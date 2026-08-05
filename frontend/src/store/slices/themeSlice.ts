import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type ThemeMode = "dark" | "light"

interface ThemeState {
  theme: ThemeMode
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cbp-theme") as ThemeMode
    if (saved === "light" || saved === "dark") return saved
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light"
  }
  return "dark"
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark"
      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-theme", state.theme)
        if (state.theme === "light") {
          document.documentElement.classList.add("light")
          document.documentElement.classList.remove("dark")
        } else {
          document.documentElement.classList.add("dark")
          document.documentElement.classList.remove("light")
        }
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-theme", state.theme)
        if (state.theme === "light") {
          document.documentElement.classList.add("light")
          document.documentElement.classList.remove("dark")
        } else {
          document.documentElement.classList.add("dark")
          document.documentElement.classList.remove("light")
        }
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
