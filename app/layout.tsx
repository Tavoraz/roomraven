import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { RavenGuide } from "@/components/raven-guide";
import { absoluteUrl, defaultDescription, defaultTitle, siteName, siteUrl } from "@/lib/seo";

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
  metadataBase: siteUrl,
  title: defaultTitle,
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Interior design software",
  keywords: [
    "AI room planner",
    "white-label room planner",
    "interior design visualizer",
    "bathroom planner",
    "kitchen visualizer",
    "room design app"
  ],
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: absoluteUrl("/home/GeneratedConcept.png"),
        width: 1200,
        height: 630,
        alt: "RoomRaven room planning preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [absoluteUrl("/home/GeneratedConcept.png")]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
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
