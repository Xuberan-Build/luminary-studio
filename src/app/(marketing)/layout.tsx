import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Quantum Strategies",
    default: "Quantum Strategies - Value Creation & Digital Marketing",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
