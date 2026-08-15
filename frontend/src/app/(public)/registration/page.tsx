import { permanentRedirect } from "next/navigation"

export default function RegistrationRedirect() {
  permanentRedirect("/register")
}
