import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — CBP 7.0",
  description:
    "Get in touch with the CBP 7.0 organizing team at MNIT Jaipur.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
