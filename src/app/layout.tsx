import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

export const metadata: Metadata = {
  title: "Luminary Studio - Austin Santos",
  description: "Mastering The Art of Creating & Adding Value. Co-Creating Asset Vehicles for Scalable Growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
