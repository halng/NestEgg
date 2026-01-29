import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NestEgg Stock Screener",
  description: "Filter stocks by financial metrics with full explainability",
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
