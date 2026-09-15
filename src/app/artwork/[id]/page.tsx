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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://art.pks.id';

  if (!artwork) {
    return {
      title: 'Karya Tidak Ditemukan | PKSart',
    };
  }

  const title = `${artwork.title} - Karya ${artwork.category} PKS`;
  const description = artwork.description || `Unduh mentahan aset ${artwork.title} karya ${artwork.region} di PKSart.`;
  const rawImage = artwork.imageUrl || (settings as any)?.ogImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop';
  const imageUrl = rawImage.startsWith('/') ? `${baseUrl}${rawImage}` : rawImage;

  return {
    title: artwork.title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/artwork/${artwork.slug || artwork.id}`,
      siteName: 'PKSart',
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
