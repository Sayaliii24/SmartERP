import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KeyboardProvider } from "@/context/KeyboardContext";
import { TallyLayout } from "@/components/TallyLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartERP - Keyboard-First Billing & Accounting",
  description: "Enterprise Billing, Accounting, and Inventory Management inspired by TallyPrime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <KeyboardProvider>
          <TallyLayout>{children}</TallyLayout>
        </KeyboardProvider>
      </body>
    </html>
  );
}

