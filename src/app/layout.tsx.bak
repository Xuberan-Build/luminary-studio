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
  title: "Luminary Studio - Value Creation & Digital Marketing",
  description:
    "Mastering the art of creating and adding value. Strategic digital marketing, SEO, and business growth solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FlashOverlay />
        <Navbar />
        <main style={{ minHeight: "100vh", paddingTop: "80px" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
