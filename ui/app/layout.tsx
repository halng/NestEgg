import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NestEgg - Stock Screener",
  description: "Privacy-first personal finance and asset management platform",
  title: "NestEgg Stock Screener",
  description: "Privacy-first stock screening with offline-capable filtering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
