import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type ThemeMode = "light"

interface ThemeState {
  theme: ThemeMode
}

const initialState: ThemeState = {
  theme: "light",
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = "light"
      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-theme", "light")
        document.documentElement.classList.add("light")
        document.documentElement.classList.remove("dark")
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload || "light"
      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-theme", "light")
        document.documentElement.classList.add("light")
        document.documentElement.classList.remove("dark")
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
