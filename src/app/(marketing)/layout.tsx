import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Luminary Studio",
    default: "Luminary Studio - Value Creation & Digital Marketing",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
