import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import BackgroundBeams from "~/components/BackgroundBeams";

export const metadata: Metadata = {
  title: {
    default: "Krish · Personal Website",
    template: "%s · Krish",
  },
  description: "Developer portfolio, music, and writings.",
  icons: [{ rel: "icon", url: "/logo.svg", type: "image/svg+xml" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#0f1020] text-white">
        <BackgroundBeams />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
