import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/layout/Footer";
import FlashOverlay from "@/components/layout/FlashOverlay";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quantum Strategies - Strategic Consulting & Business Growth",
  description:
    "Transform your business with strategic consulting, proven frameworks, and actionable courses. Master customer acquisition, product development, and operations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FlashOverlay active={false} />
        <Navbar />
        <main style={{ minHeight: "100vh", paddingTop: "80px" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
