import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import ArtworkDetailContent from './ArtworkDetailContent';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const artwork = await prisma.artwork.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
  });

  const settings = await prisma.siteSettings.findFirst();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://konikph.site';

  if (!artwork) {
    return {
      title: 'Karya Tidak Ditemukan | KONI Kabupaten Kepahiang',
    };
  }

  const title = `${artwork.title} - ${artwork.category} KONI Kepahiang`;
  const description = artwork.description || `Unduh dokumentasi & aset ${artwork.title} cabor ${artwork.region} di portal KONI Kepahiang.`;
  const rawImage = artwork.imageUrl || (settings as any)?.ogImageUrl || '/img/877859417715829.jpg';
  const imageUrl = rawImage.startsWith('/') ? `${baseUrl}${rawImage}` : rawImage;

  return {
    title: artwork.title,
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
      url: `${baseUrl}/artwork/${artwork.slug || artwork.id}`,
      siteName: 'KONI Kabupaten Kepahiang',
      images: [imageUrl],
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

export default function ArtworkDetailPage() {
  return <ArtworkDetailContent />;
}
