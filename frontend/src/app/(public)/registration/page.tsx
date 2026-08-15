import { RegistrationPage } from "@/features/public-registration/components/RegistrationPage"

export const metadata = {
  title: "CBP 7.0 Public Event Registration",
  description: "Register for CBP 7.0 flagship event without requiring account setup or login.",
}

export default function PublicRegistrationRoute() {
  return <RegistrationPage />
}
