import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration — CBP 7.0",
  description:
    "Register for CBP 7.0 at MNIT Jaipur. 5-day Soft Skills Development Program.",
};

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
