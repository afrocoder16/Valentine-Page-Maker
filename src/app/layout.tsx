import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeMyValentine",
  description: "Create a Valentine page in minutes and share it instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <div className="relative min-h-screen bg-[#fff7f4] text-slate-900">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 blur-3xl" />
            <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-amber-200 via-rose-200 to-pink-200 blur-3xl" />
          </div>
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
