import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import TwibbonDetailContent from './TwibbonDetailContent';
import { getTwibbonBySlugOrId } from '@/actions/twibbon';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const twibbon = await prisma.twibbonFrame.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
  });

  const settings = await prisma.siteSettings.findFirst();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://art.pks.id';

  if (!twibbon) {
    return {
      title: 'Twibbon Tidak Ditemukan | PKSart',
    };
  }

  const title = `Twibbon ${twibbon.title} - Bingkai Foto Official PKS`;
  const description = `Pasang foto Anda pada bingkai twibbon ${twibbon.title} official PKS secara online di PKSart.`;
  const rawImage = twibbon.imageUrl || (settings as any)?.ogImageUrl || '/img/877859417715829.jpg';
  const imageUrl = rawImage.startsWith('/') ? `${baseUrl}${rawImage}` : rawImage;

  return {
    title: twibbon.title,
    description,
    icons: {
      icon: [
        { url: settings?.faviconUrl || '/favicon.ico', sizes: 'any' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: settings?.faviconUrl || '/favicon.ico',
      apple: settings?.faviconUrl || '/apple-touch-icon.png',
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/twibbon/${twibbon.slug || twibbon.id}`,
      siteName: 'PKSart',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: twibbon.title,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function TwibbonDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const res = await getTwibbonBySlugOrId(id);
  const initialTwibbon = res?.success && res.data ? res.data : null;

  return <TwibbonDetailContent initialTwibbon={initialTwibbon} />;
}
