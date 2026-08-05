import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import StoreProvider from "@/store/StoreProvider";
import AuthGuard from "@/components/layout/AuthGuard";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CBP 7.0 — Capacity Building Program | MNIT Jaipur",
    template: "%s | CBP 7.0 MNIT Jaipur",
  },
  description:
    "CBP 7.0 — A comprehensive 5-day Soft Skills Development Program by the Department of Humanities & Social Sciences and the Training & Placement Cell, MNIT Jaipur.",
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
      "A 5-day Soft Skills Development Program by the Department of Humanities & Social Sciences and Training & Placement Cell, MNIT Jaipur.",
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
    <>
      <html lang="en" className={`${inter.variable} h-full antialiased light`} suppressHydrationWarning>
        <body className="min-h-full flex flex-col font-sans transition-colors duration-300 bg-slate-50 text-slate-900 bg-grid-cyber selection:bg-cyan-600 selection:text-white" suppressHydrationWarning>
          <StoreProvider>
            <AuthGuard>
              <TopBanner />
              <Header />
              {children}
              <Footer />
            </AuthGuard>
          </StoreProvider>
        </body>
      </html>
    </>
  );
}
