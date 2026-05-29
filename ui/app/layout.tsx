import type { Metadata } from "next";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VN Market Screener | Premium Stock Analysis",
  description: "A compact, premium stock screener covering HOSE, HNX, and UPCOM markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Navbar />
              <div className="min-h-0 flex-1">{children}</div>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
