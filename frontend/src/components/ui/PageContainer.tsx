"use client"

import React from "react"
import { PageHeader, PageHeaderAction } from "./PageHeader"

export interface PageContainerProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: "normal" | "full" | "narrow"
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className = "",
  maxWidth = "normal",
}: PageContainerProps) {
  const widthClasses = {
    narrow: "max-w-4xl",
    normal: "max-w-7xl",
    full: "max-w-full",
  }

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${widthClasses[maxWidth]} ${className}`}>
      {title && <PageHeader title={title} subtitle={subtitle} actions={actions} />}
      {children}
    </div>
  )
}
