import { Metadata } from "next"
import { RegistrationStatusPage } from "@/features/public-registration/pages/RegistrationStatusPage"

export const metadata: Metadata = {
  title: "Check Registration Status | CBP 7.0",
  description: "Check your CBP 7.0 registration and payment status without login.",
}

export default function RegistrationStatus() {
  return <RegistrationStatusPage />
}
