import { configureStore } from "@reduxjs/toolkit"
import themeReducer from "./slices/themeSlice"
import uiReducer from "./slices/uiSlice"
import authReducer from "./slices/authSlice"

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
