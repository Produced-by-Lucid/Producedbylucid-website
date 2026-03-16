import * as React from "react";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource/zilla-slab/300.css";
import "@fontsource/zilla-slab/400.css";
import "@fontsource/zilla-slab/500.css";
import "@fontsource/zilla-slab/600.css";
import "@fontsource/zilla-slab/700.css";
import { getSiteSettings } from "@/lib/site-content";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? settings.siteUrl),
    applicationName: settings.siteName,
    generator: "Next.js",
    title: {
      default: settings.defaultTitle,
      template: settings.titleTemplate,
    },
    description: settings.description,
    abstract: settings.abstract,
    keywords: settings.keywords,
    authors: [{ name: settings.creator }],
    creator: settings.creator,
    publisher: settings.publisher,
    category: settings.category,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.siteName,
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
      siteName: settings.siteName,
      title: settings.defaultTitle,
      description: settings.description,
      locale: "en_US",
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: `${settings.siteName} event planning and production`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.defaultTitle,
      description: settings.description,
      creator: settings.twitterHandle,
      site: settings.twitterHandle,
      images: [settings.ogImage],
    },
    other: {
      "msapplication-TileColor": settings.themeColor,
    },
  };
}

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
  const bodyClassName = `${castio.variable} antialiased`;

  return (
    <html lang="en">
      <body suppressHydrationWarning className={bodyClassName}>
        {children}
      </body>
    </html>
  );
}
