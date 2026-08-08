import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DataProvider } from "@/context/DataContext";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getDBSiteSettings } from "@/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settingsRes = await getDBSiteSettings();
  const settings = settingsRes?.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pksart.site';
  
  const siteTitle = settings?.siteName || "PKSart - Galeri Desain & Foto PKS Official";
  const siteDesc = settings?.siteDescription || "Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.";
  
  // Custom uploaded OG Image -> fallback to default
  const rawOgUrl = settings?.ogImageUrl || '/img/877859417715829.jpg';
  const ogImageUrl = rawOgUrl.startsWith('/') ? `${baseUrl}${rawOgUrl}` : rawOgUrl;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: "%s | PKSart",
    },
    description: siteDesc,
    keywords: ["PKS", "Desain PKS", "Poster PKS", "Twibbon PKS", "Brand Kit PKS", "Aset Desain", "Desainer PKS"],
    icons: {
      icon: settings?.faviconUrl || '/favicon.ico',
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: baseUrl,
      siteName: 'PKSart',
      images: [ogImageUrl],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDesc,
      images: [ogImageUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch site settings on the server so DataProvider starts with real data (zero logo flash)
  const settingsRes = await getDBSiteSettings();
  const initialSettings = settingsRes?.success ? settingsRes.data : undefined;

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0 bg-[#F8F9FA] text-gray-900" suppressHydrationWarning>
        <DataProvider initialSettings={initialSettings}>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
          <MobileBottomNav />
        </DataProvider>
      </body>
    </html>
  );
}

