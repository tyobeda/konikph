import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

import { getDBSiteSettings } from "@/actions/settings";
import { getCurrentServerUser } from "@/lib/serverAuth";

export async function generateMetadata(): Promise<Metadata> {
  const settingsRes = await getDBSiteSettings();
  const settings = settingsRes?.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://konikph.site';
  
  const siteTitle = settings?.siteName || "KONI Kabupaten Kepahiang - Media Informasi & Twibbon Resmi";
  const siteDesc = settings?.siteDescription || "Website resmi Komite Olahraga Nasional Indonesia (KONI) Kabupaten Kepahiang. Informasi kegiatan olahraga, cabang olahraga, berita, dan twibbon.";
  
  // Custom uploaded OG Image -> fallback to default
  const rawOgUrl = settings?.ogImageUrl || '/img/877859417715829.jpg';
  const ogImageUrl = rawOgUrl.startsWith('/') ? `${baseUrl}${rawOgUrl}` : rawOgUrl;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: "%s | KONI Kabupaten Kepahiang",
    },
    description: siteDesc,
    keywords: ["KONI", "KONI Kepahiang", "Kabupaten Kepahiang", "Olahraga Kepahiang", "Cabor Kepahiang", "Twibbon KONI", "Porkab Kepahiang"],
    icons: {
      icon: [
        { url: settings?.faviconUrl || '/favicon.ico', sizes: 'any' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: settings?.faviconUrl || '/favicon.ico',
      apple: settings?.faviconUrl || '/apple-touch-icon.png',
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: baseUrl,
      siteName: 'KONI Kabupaten Kepahiang',
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
  // Fetch site settings and authenticated user on server for zero flash & perfect hydration
  const [settingsRes, initialUser] = await Promise.all([
    getDBSiteSettings(),
    getCurrentServerUser(),
  ]);
  const initialSettings = settingsRes?.success ? settingsRes.data : undefined;
  const faviconHref = initialSettings?.faviconUrl || '/favicon.ico';

  // Read theme cookie server-side to pre-render correct dark class — eliminates flash entirely
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get('koni_theme')?.value;
  const serverIsDark = savedTheme === 'dark';
  const htmlClass = `${plusJakartaSans.variable} h-full antialiased${serverIsDark ? ' dark' : ''}`;

  return (
    <html
      lang="id"
      className={htmlClass}
      data-theme={serverIsDark ? 'dark' : 'light'}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={faviconHref} sizes="any" />
        <link rel="shortcut icon" href={faviconHref} />
        <link rel="apple-touch-icon" href={faviconHref} />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0 bg-[#F8F9FA] dark:bg-[#0B0F17] text-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <ThemeProvider>
          <DataProvider initialSettings={initialSettings} initialUser={initialUser as any}>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            {children}
            <MobileBottomNav />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
