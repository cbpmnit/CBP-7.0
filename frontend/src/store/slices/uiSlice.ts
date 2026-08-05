import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  mobileMenuOpen: boolean
  activeModal: string | null
  topBannerVisible: boolean
}

const initialState: UiState = {
  mobileMenuOpen: false,
  activeModal: null,
  topBannerVisible: true,
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
    hideTopBanner: (state) => {
      state.topBannerVisible = false
    },
  },
})

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  openModal,
  closeModal,
  hideTopBanner,
} = uiSlice.actions
export default uiSlice.reducer
