import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/layout/Footer";
import FlashOverlay from "@/components/layout/FlashOverlay";
import CookieConsent from "@/components/legal/CookieConsent";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const inter = Inter({ subsets: ["latin"] });
const baseUrl = new URL("https://quantumstrategies.online");

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: "Quantum Strategies - Strategic Consulting & Business Growth",
  description:
    "Transform your business with strategic consulting, proven frameworks, and actionable courses. Master customer acquisition, product development, and operations.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://quantumstrategies.online/",
  },
  openGraph: {
    title: "Quantum Strategies - Strategic Consulting & Business Growth",
    description:
      "Transform your business with strategic consulting, proven frameworks, and actionable courses. Master customer acquisition, product development, and operations.",
    url: baseUrl,
    siteName: "Quantum Strategies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Strategies - Strategic Consulting & Business Growth",
    description:
      "Transform your business with strategic consulting, proven frameworks, and actionable courses. Master customer acquisition, product development, and operations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Quantum Strategies",
    url: baseUrl.toString(),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Quantum Strategies",
    url: baseUrl.toString(),
    publisher: {
      "@type": "Organization",
      name: "Quantum Strategies",
      url: baseUrl.toString(),
    },
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <FlashOverlay active={false} />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
