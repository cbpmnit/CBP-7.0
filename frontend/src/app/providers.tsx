"use client"

import React from "react"
import StoreProvider from "@/store/StoreProvider"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return <StoreProvider>{children}</StoreProvider>
}
