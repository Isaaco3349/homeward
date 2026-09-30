import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homeward — agentic remittance on Moove",
  description:
    "Policy-governed diaspora payment agent: natural language plans, confirm-first, Moove payment links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
