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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pks.art'),
  title: {
    default: "PKSart - Galeri Desain & Foto PKS Official",
    template: "%s | PKSart",
  },
  description: "Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.",
  keywords: ["PKS", "Desain PKS", "Poster PKS", "Twibbon PKS", "Brand Kit PKS", "Aset Desain", "Kreator PKS"],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "PKSart - Galeri Desain & Foto PKS Official",
    description: "Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.",
    url: 'https://pks.art',
    siteName: 'PKSart',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PKSart - Galeri Desain & Foto PKS Official",
    description: "Platform galeri poster, spanduk, social media kit, dan aset desain resmi PKS.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0 bg-[#F8F9FA] text-gray-900" suppressHydrationWarning>
        <DataProvider>
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

