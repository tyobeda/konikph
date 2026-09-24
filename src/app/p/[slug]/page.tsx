import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Metadata } from 'next';
import CustomPageContent from './CustomPageContent';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.customPage.findFirst({
    where: { slug: { equals: slug, mode: 'insensitive' }, published: true },
  });
  if (!page) return {};

  const settings = await prisma.siteSettings.findFirst();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://art.pks.id';
  
  const rawOgUrl = (page as any).ogImageUrl || (settings as any)?.ogImageUrl || '/img/877859417715829.jpg';
  const ogImageUrl = rawOgUrl.startsWith('/') ? `${baseUrl}${rawOgUrl}` : rawOgUrl;

  return {
    title: page.title,
    icons: {
      icon: [
        { url: settings?.faviconUrl || '/favicon.ico', sizes: 'any' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: settings?.faviconUrl || '/favicon.ico',
      apple: settings?.faviconUrl || '/apple-touch-icon.png',
    },
    openGraph: {
      title: `${page.title} | PKSart`,
      url: `${baseUrl}/p/${page.slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | PKSart`,
      images: [ogImageUrl],
    },
  };
}

export default async function CustomPageRenderer({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const page = await prisma.customPage.findFirst({
    where: {
      slug: { equals: slug, mode: 'insensitive' },
      published: true,
    },
  });

  if (!page) {
    notFound();
  }

  const pageData = {
    id: page.id,
    title: page.title,
    content: page.content,
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
      <Header />
      <CustomPageContent page={pageData} />
      <Footer />
    </div>
  );
}
