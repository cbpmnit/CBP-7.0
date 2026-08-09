/**
 * CBP 7.0 Design System - Centralized Design Tokens
 * 
 * Follows the official MNIT Jaipur Institutional Platform guidelines:
 * - Minimalist, lightweight, enterprise dashboard
 * - White backgrounds, soft slate borders, subtle elevation
 * - CBP Blue / MNIT Cyan / Deep Navy palette
 */

export const designTokens = {
  colors: {
    primary: {
      DEFAULT: "#0284C7", // CBP Blue (sky-600)
      dark: "#0369A1",    // Deep CBP Blue (sky-700)
      light: "#0EA5E9",   // Light CBP Blue (sky-500)
      subtle: "#F0F9FF",  // sky-50
      border: "#BAE6FD",  // sky-200
    },
    cyan: {
      DEFAULT: "#0891B2", // MNIT Cyan (cyan-600)
      dark: "#0E7490",    // Deep Cyan (cyan-700)
      light: "#06B6D4",   // Bright Cyan (cyan-500)
      subtle: "#ECFEFF",  // cyan-50
      border: "#A5F3FC",  // cyan-200
    },
    navy: {
      DEFAULT: "#0F172A", // Deep Institutional Navy (slate-900)
      subtle: "#1E293B",  // slate-800
      muted: "#334155",   // slate-700
    },
    background: {
      canvas: "#F8FAFC",  // slate-50
      card: "#FFFFFF",    // pure white
      subtle: "#F1F5F9",  // slate-100
      muted: "#E2E8F0",   // slate-200
    },
    border: {
      subtle: "#E2E8F0",  // slate-200
      medium: "#CBD5E1",  // slate-300
      focus: "#0284C7",   // sky-600
    },
    text: {
      primary: "#0F172A", // slate-900
      secondary: "#334155", // slate-700
      muted: "#64748B",   // slate-500
      subtle: "#94A3B8",  // slate-400
    },
    status: {
      success: {
        bg: "#ECFDF5",    // emerald-50
        border: "#A7F3D0", // emerald-200
        text: "#065F46",  // emerald-800
        accent: "#059669",// emerald-600
      },
      warning: {
        bg: "#FFFBEB",    // amber-50
        border: "#FDE68A", // amber-200
        text: "#92400E",  // amber-800
        accent: "#D97706",// amber-600
      },
      error: {
        bg: "#FEF2F2",    // rose-50
        border: "#FECDD3", // rose-200
        text: "#9F1239",  // rose-800
        accent: "#E11D48",// rose-600
      },
      purple: {
        bg: "#FAF5FF",    // purple-50
        border: "#E9D5FF", // purple-200
        text: "#6B21A8",  // purple-800
        accent: "#7C3AED",// purple-600
      },
      info: {
        bg: "#F0F9FF",    // sky-50
        border: "#BAE6FD", // sky-200
        text: "#075985",  // sky-800
        accent: "#0284C7",// sky-600
      }
    }
  },
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    full: "rounded-full",
  },
  shadows: {
    subtle: "shadow-xs",
    card: "shadow-sm",
    hover: "shadow-md",
    dropdown: "shadow-xl",
  },
  typography: {
    fontSans: "var(--font-geist-sans), Inter, sans-serif",
    fontMono: "var(--font-geist-mono), monospace",
  }
} as const

export type DesignTokens = typeof designTokens
