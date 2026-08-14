import AccountSettingsView from "@/features/account/components/AccountSettingsView"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account Settings | CBP 7.0",
  description: "Manage your student profile information, academic details, and security credentials.",
}

export default function AccountSettingsPage() {
  return <AccountSettingsView />
}
