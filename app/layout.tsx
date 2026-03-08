import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { RavenGuide } from "@/components/raven-guide";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"]
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "700"]
});

export const metadata: Metadata = {
  title: "RoomRaven",
  description: "Upload a room, add inspiration, and generate design concepts to compare.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <div className="site-shader site-shader-a" aria-hidden="true" />
        <div className="site-shader site-shader-b" aria-hidden="true" />
        <div className="site-shader site-shader-c" aria-hidden="true" />
        <div className="grain-shader" aria-hidden="true" />
        {children}
        <RavenGuide />
      </body>
    </html>
  );
}
