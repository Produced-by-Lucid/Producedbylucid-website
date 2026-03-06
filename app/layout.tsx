import * as React from "react";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Zilla_Slab } from "next/font/google";
import "./globals.css";

const castio = localFont({
  src: [
    {
      path: "../public/fonts/castio-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/castio-italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-display",
});

const zillaSlab = Zilla_Slab({
  variable: "--font-paragraph",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://producedbylucid.com"),
  applicationName: "Produced by Lucid",
  generator: "Next.js",
  title: {
    default: "Produced by Lucid | Event Planning & Production Agency",
    template: "%s | Produced by Lucid",
  },
  description:
    "Produced by Lucid is an event planning and production agency creating bold, elevated experiences for brands and events.",
  abstract: "Event planning and production agency for elevated brand experiences.",
  keywords: [
    "Produced by Lucid",
    "event planning",
    "event production",
    "experiential marketing",
    "corporate events",
    "event design",
    "Lagos",
  ],
  authors: [{ name: "Produced by Lucid" }],
  creator: "Produced by Lucid",
  publisher: "Produced by Lucid",
  category: "Events",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Produced by Lucid",
  },
  alternates: {
    canonical: "/",
  },
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/fav-icon.png", type: "image/png", sizes: "16x16" },
      { url: "/fav-icon.png", type: "image/png", sizes: "32x32" },
      { url: "/fav-icon-180.png", type: "image/png", sizes: "180x180" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: [{ url: "/fav-icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/fav-icon.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Produced by Lucid",
    title: "Produced by Lucid | Event Planning & Production Agency",
    description:
      "Produced by Lucid is an event planning and production agency creating bold, elevated experiences for brands and events.",
    locale: "en_US",
    images: [
      {
        url: "/nice-bg.png",
        width: 1200,
        height: 630,
        alt: "Produced by Lucid event planning and production",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Produced by Lucid | Event Planning & Production Agency",
    description:
      "Produced by Lucid is an event planning and production agency creating bold, elevated experiences for brands and events.",
    creator: "@producedbylucid",
    site: "@producedbylucid",
    images: ["/nice-bg.png"],
  },
  other: {
    "msapplication-TileColor": "#174826",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#174826",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassName = `${castio.variable} ${zillaSlab.variable} antialiased`;

  return (
    <html lang="en">
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
