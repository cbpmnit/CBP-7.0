import { Metadata } from "next"
import { RegistrationPage } from "@/features/public-registration/components/RegistrationPage"

export const metadata: Metadata = {
  title: "CBP 7.0 Event Registration | MNIT Jaipur",
  description: "Official event registration for CBP 7.0 at MNIT Jaipur. Complete details and registration fee payment securely without prior login.",
  alternates: {
    canonical: "https://cbpmnit.in/register",
  },
}

export default function RegisterRoute() {
  return <RegistrationPage />
}
