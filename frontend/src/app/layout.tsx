import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import Providers from "./providers";
import AuthGuard from "@/components/layout/AuthGuard";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: any = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "CBP 7.0 — Capacity Building Program | MNIT Jaipur",
    template: "%s | CBP 7.0 MNIT Jaipur",
  },
  description:
    "CBP 7.0 — A comprehensive 4-day Soft Skills Development Program by the Department of Humanities & Social Sciences and the Training & Placement Cell, MNIT Jaipur.",
  icons: {
    icon: "/favicon/cbp-primary-full-logo-transparent-background.webp",
  },
  keywords: [
    "CBP 7.0",
    "MNIT Jaipur",
    "Capacity Building Program",
    "Soft Skills",
    "Training & Placement",
    "MNIT",
  ],
  authors: [{ name: "MNIT Jaipur" }],
  openGraph: {
    title: "CBP 7.0 — Capacity Building Program | MNIT Jaipur",
    description:
      "A 4-day Soft Skills Development Program by the Department of Humanities & Social Sciences and Training & Placement Cell, MNIT Jaipur.",
    type: "website",
    locale: "en_IN",
    siteName: "CBP 7.0 MNIT Jaipur",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased light`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300 bg-cbp-grid text-slate-900 selection:bg-cyan-600 selection:text-white" suppressHydrationWarning>
        <Providers>
          <AuthGuard>
            <TopBanner />
            <Header />
            <div className="flex-1 w-full relative">
              {children}
            </div>
            <Footer />
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}

