import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quantum Strategies",
  description: "Strategic consulting and business growth solutions",
};

export default function ContentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}
