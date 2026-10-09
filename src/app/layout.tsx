import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://art.pks.id';
  
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
  // Fetch site settings and authenticated user on the server so DataProvider starts with real data (zero flash)
  const [settingsRes, initialUser] = await Promise.all([
    getDBSiteSettings(),
    getCurrentServerUser(),
  ]);
  const initialSettings = settingsRes?.success ? settingsRes.data : undefined;
  const faviconHref = initialSettings?.faviconUrl || '/favicon.ico';

  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={faviconHref} sizes="any" />
        <link rel="shortcut icon" href={faviconHref} />
        <link rel="apple-touch-icon" href={faviconHref} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('pksart_theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || ((!stored || stored === 'system') && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
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

