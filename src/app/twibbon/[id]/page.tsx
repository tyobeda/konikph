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
  let baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://koni-kph.site').trim();
  if (baseUrl.includes('konikph.site') && !baseUrl.includes('koni-kph.site')) {
    baseUrl = baseUrl.replace('konikph.site', 'koni-kph.site');
  }
  baseUrl = baseUrl.replace(/\/$/, '');

  if (!twibbon) {
    return {
      title: 'Twibbon Tidak Ditemukan | KONI Kabupaten Kepahiang',
    };
  }

  const title = `Twibbon ${twibbon.title} - Bingkai Foto Resmi KONI Kepahiang`;
  const description = twibbon.description?.trim() 
    ? `${twibbon.description} - Pasang foto Anda secara instan di bingkai twibbon resmi KONI Kabupaten Kepahiang.`
    : `Pasang foto Anda pada bingkai twibbon ${twibbon.title} resmi KONI Kabupaten Kepahiang.`;

  const rawImage = twibbon.imageUrl || (settings as any)?.ogImageUrl || '/img/877859417715829.jpg';
  const imageUrl = rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  const imageWidth = twibbon.width || 1080;
  const imageHeight = twibbon.height || 1080;
  const imageType = imageUrl.toLowerCase().endsWith('.png') 
    ? 'image/png' 
    : imageUrl.toLowerCase().endsWith('.webp') 
    ? 'image/webp' 
    : 'image/jpeg';

  const twibbonUrl = `${baseUrl}/twibbon/${twibbon.slug || twibbon.id}`;

  return {
    metadataBase: new URL(baseUrl),
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
      url: twibbonUrl,
      siteName: 'KONI Kabupaten Kepahiang',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: imageWidth,
          height: imageHeight,
          type: imageType,
          alt: twibbon.title,
        },
      ],
      locale: 'id_ID',
      type: 'article',
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
