import React from "react"
import CompleteAccountView from "@/features/auth/components/CompleteAccountView"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Complete Account Setup | CBP 7.0",
  description: "Complete your login credentials by adding your official Student ID and password.",
}

export default function CompleteAccountPage() {
  return <CompleteAccountView />
}
