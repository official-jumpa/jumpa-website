import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jumpa wallet",
  description: "A unified crypto wallet and financial platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
